import Foundation
import Capacitor
import LocalAuthentication
import Security

// Stores the user's login credentials in the iOS Keychain behind a
// biometry-gated access control entry (Face ID / Touch ID). Face ID never
// talks to the server — it only unlocks the credentials that were saved
// locally after a normal password login, which are then replayed against
// the existing /api/auth/login endpoint.
@objc(BiometricPlugin)
public class BiometricPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "BiometricPlugin"
    public let jsName = "Biometric"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "isAvailable", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setCredentials", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getCredentials", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "deleteCredentials", returnType: CAPPluginReturnPromise),
    ]

    private let service = "com.qrmingle.app.biometric-login"

    @objc func isAvailable(_ call: CAPPluginCall) {
        let context = LAContext()
        var error: NSError?
        let available = context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error)
        let biometryType: String
        switch context.biometryType {
        case .faceID: biometryType = "faceId"
        case .touchID: biometryType = "touchId"
        default: biometryType = "none"
        }
        call.resolve([
            "isAvailable": available,
            "biometryType": biometryType,
        ])
    }

    @objc func setCredentials(_ call: CAPPluginCall) {
        guard let username = call.getString("username"), let password = call.getString("password") else {
            call.reject("username and password are required")
            return
        }

        let context = LAContext()
        context.localizedReason = "Confirm to enable Face ID login for QrMingle"
        context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: context.localizedReason) { success, evalError in
            DispatchQueue.main.async {
                guard success else {
                    call.reject(evalError?.localizedDescription ?? "Biometric confirmation failed")
                    return
                }
                self.deleteKeychainItem()

                var accessControlError: Unmanaged<CFError>?
                guard let accessControl = SecAccessControlCreateWithFlags(
                    kCFAllocatorDefault,
                    kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
                    .biometryCurrentSet,
                    &accessControlError
                ) else {
                    call.reject("Failed to create secure access control")
                    return
                }

                let payload = ["username": username, "password": password]
                guard let data = try? JSONSerialization.data(withJSONObject: payload) else {
                    call.reject("Failed to encode credentials")
                    return
                }

                let query: [String: Any] = [
                    kSecClass as String: kSecClassGenericPassword,
                    kSecAttrService as String: self.service,
                    kSecValueData as String: data,
                    kSecAttrAccessControl as String: accessControl,
                ]

                let status = SecItemAdd(query as CFDictionary, nil)
                if status == errSecSuccess {
                    call.resolve()
                } else {
                    call.reject("Keychain write failed (status \(status))")
                }
            }
        }
    }

    @objc func getCredentials(_ call: CAPPluginCall) {
        let context = LAContext()
        context.localizedReason = "Log in to QrMingle"

        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecReturnData as String: true,
            kSecUseAuthenticationContext as String: context,
            kSecUseOperationPrompt as String: context.localizedReason as Any,
        ]

        DispatchQueue.global(qos: .userInitiated).async {
            var result: AnyObject?
            let status = SecItemCopyMatching(query as CFDictionary, &result)
            DispatchQueue.main.async {
                guard status == errSecSuccess, let data = result as? Data,
                      let payload = try? JSONSerialization.jsonObject(with: data) as? [String: String],
                      let username = payload["username"], let password = payload["password"] else {
                    if status == errSecItemNotFound {
                        call.reject("NOT_FOUND")
                    } else if status == errSecUserCanceled {
                        call.reject("CANCELLED")
                    } else {
                        call.reject("Biometric authentication failed (status \(status))")
                    }
                    return
                }
                call.resolve(["username": username, "password": password])
            }
        }
    }

    @objc func deleteCredentials(_ call: CAPPluginCall) {
        deleteKeychainItem()
        call.resolve()
    }

    private func deleteKeychainItem() {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
        ]
        SecItemDelete(query as CFDictionary)
    }
}
