from python_server.auth.auth import hash_password, verify_password
password = hash_password('demo')
print(f'Demo password hash: {password}')
print(f'Verify demo password: {verify_password(password, "demo")}')

