import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('43.138.253.185', username='root', password='Ys@20041030', timeout=10)

# 直接安装 npm（跳过 apt update 加速）
stdin, stdout, stderr = client.exec_command('apt-get install -y npm 2>&1 | tail -10')
out = stdout.read().decode()
err = stderr.read().decode()
print(out)
if err:
    print('ERR:', err[:500])

# 验证
stdin, stdout, stderr = client.exec_command('which npm && npm --version')
print(stdout.read().decode())

stdin, stdout, stderr = client.exec_command('which node && node --version')
print(stdout.read().decode())

client.close()
