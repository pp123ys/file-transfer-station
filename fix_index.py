import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('43.138.253.185', username='root', password='Ys@20041030', timeout=10)

# 用 public/index.html 替换 dist/index.html
stdin, stdout, stderr = client.exec_command('cat /root/guantou-deploy/frontend/dist/public/index.html > /root/guantou-deploy/frontend/dist/index.html && echo OK && cat /root/guantou-deploy/frontend/dist/index.html')
out = stdout.read().decode()
err = stderr.read().decode()
print(out)
if err:
    print('ERR:', err)

# 验证前端现在是否正确
stdin, stdout, stderr = client.exec_command('curl -s http://localhost/ | head -15')
print('\n--- Nginx 返回 ---')
print(stdout.read().decode())

client.close()
