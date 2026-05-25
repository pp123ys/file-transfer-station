import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('43.138.253.185', username='root', password='Ys@20041030', timeout=10)

# 看 index.html 引用的是哪个 JS
stdin, stdout, stderr = client.exec_command('cat /root/guantou-deploy/frontend/dist/index.html')
print('Server dist/index.html:')
print(stdout.read().decode())

# 看本地 dist/index.html 是什么
stdin, stdout, stderr = client.exec_command('cat /root/guantou-deploy/frontend/dist/public/index.html')
print('Server dist/public/index.html:')
print(stdout.read().decode())

client.close()
