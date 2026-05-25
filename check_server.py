import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('43.138.253.185', username='root', password='Ys@20041030', timeout=10)

# 查看服务器上的项目结构和 git 状态
stdin, stdout, stderr = client.exec_command('cd /root/guantou-deploy && ls -la && echo "---" && git log --oneline -3 2>/dev/null || echo "非git仓库"')
print(stdout.read().decode())

client.close()
