import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('43.138.253.185', username='root', password='Ys@20041030', timeout=10)

# 验证前端 dist 文件日期
stdin, stdout, stderr = client.exec_command('ls -la /root/guantou-deploy/frontend/dist/assets/')
print('dist assets:')
print(stdout.read().decode())

# 检查前端是否包含存储配额相关代码
stdin, stdout, stderr = client.exec_command('curl -s http://localhost/ | grep -o "storage\|quota\|配额\|存储" | head -5 || echo "not found in HTML"')
print('HTML keywords:', stdout.read().decode())

# 检查 JS 里有没有存储配额相关
stdin, stdout, stderr = client.exec_command('ls /root/guantou-deploy/frontend/dist/assets/main-*.js')
js_file = stdout.read().decode().strip()
print('JS file:', js_file)

stdin, stdout, stderr = client.exec_command(f'grep -c "storage.*quota\|quota.*storage\|STORAGE_QUOTA\|storageQuota" {js_file} 2>/dev/null || echo 0')
print('Storage quota refs in JS:', stdout.read().decode().strip())

client.close()
