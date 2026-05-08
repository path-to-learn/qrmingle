import Foundation
import Capacitor
import StoreKit

@objc(IAPPlugin)
public class IAPPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "IAPPlugin"
    public let jsName = "IAP"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getProducts", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "purchase", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "restorePurchases", returnType: CAPPluginReturnPromise),
    ]

    @objc func getProducts(_ call: CAPPluginCall) {
        guard let productIds = call.getArray("productIds") as? [String], !productIds.isEmpty else {
            call.reject("productIds is required")
            return
        }
        Task {
            do {
                let products = try await Product.products(for: Set(productIds))
                let result = products.map { p in
                    ["id": p.id, "title": p.displayName, "description": p.description,
                     "price": "\(p.price)", "displayPrice": p.displayPrice] as [String: Any]
                }
                call.resolve(["products": result])
            } catch {
                call.reject("Failed to fetch products: \(error.localizedDescription)")
            }
        }
    }

    @objc func purchase(_ call: CAPPluginCall) {
        guard let productId = call.getString("productId") else {
            call.reject("productId is required")
            return
        }
        Task {
            do {
                let products = try await Product.products(for: [productId])
                guard let product = products.first else {
                    call.reject("Product not found: \(productId)")
                    return
                }
                let result = try await product.purchase()
                switch result {
                case .success(let verification):
                    switch verification {
                    case .verified(let transaction):
                        await transaction.finish()
                        call.resolve([
                            "transactionId": transaction.id,
                            "originalTransactionId": transaction.originalID,
                            "productId": transaction.productID,
                            "jwsRepresentation": verification.jwsRepresentation,
                        ])
                    case .unverified(_, let error):
                        call.reject("Transaction unverified: \(error.localizedDescription)")
                    }
                case .userCancelled:
                    call.reject("CANCELLED")
                case .pending:
                    call.reject("PENDING")
                @unknown default:
                    call.reject("Unknown purchase result")
                }
            } catch {
                call.reject("Purchase failed: \(error.localizedDescription)")
            }
        }
    }

    @objc func restorePurchases(_ call: CAPPluginCall) {
        Task {
            var restored: [[String: Any]] = []
            for await result in Transaction.currentEntitlements {
                if case .verified(let transaction) = result {
                    restored.append([
                        "transactionId": transaction.id,
                        "originalTransactionId": transaction.originalID,
                        "productId": transaction.productID,
                        "jwsRepresentation": result.jwsRepresentation,
                    ])
                }
            }
            call.resolve(["transactions": restored])
        }
    }
}
