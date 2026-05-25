import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('43.138.253.185', username='root', password='Ys@20041030', timeout=10)

# 安装 npm 然后重建前端
stdin, stdout, stderr = client.exec_command('apt-get update -qq && apt-get install -y -qq npm 2>&1 | tail -5 && npm --version && cd /root/guantou-deploy/frontend && npm install 2>&1 | tail -3 && VITE_API_URL=/api npm run build 2>&1')
out = stdout.read().decode()
err = stderr.read().decode()
print(out)
if err:
    print('ERR:', err)

client.close()
