import paramiko
import os, glob

host = '43.138.253.185'
user = 'root'
pwd = 'Ys@20041030'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(host, username=user, password=pwd, timeout=15)

sftp = client.open_sftp()

# 上传 dist 文件
local_dist = r'D:\text\file transfer station\frontend\dist'
remote_dist = '/root/guantou-deploy/frontend/dist'

print('=== 上传前端 dist ===')
for root, dirs, files in os.walk(local_dist):
    for f in files:
        local_path = os.path.join(root, f)
        rel_path = os.path.relpath(local_path, local_dist)
        remote_path = f'{remote_dist}/{rel_path}'.replace('\\', '/')
        
        # 确保目录存在
        remote_dir = os.path.dirname(remote_path)
        try:
            sftp.stat(remote_dir)
        except:
            dirs_list = remote_dir.split('/')
            for i in range(2, len(dirs_list)+1):
                partial = '/'.join(dirs_list[:i])
                try:
                    sftp.stat(partial)
                except:
                    sftp.mkdir(partial)
        
        sftp.put(local_path, remote_path)
        print(f'  OK  dist/{rel_path}')

sftp.close()

# 重启 nginx
print('\n=== 重启 Nginx ===')
stdin, stdout, stderr = client.exec_command('cd /root/guantou-deploy && docker compose restart nginx 2>&1')
print(stdout.read().decode())

# 验证
import time
time.sleep(2)
stdin, stdout, stderr = client.exec_command('curl -s -o /dev/null -w "前端 HTTP: %{http_code}" http://localhost/ && echo "" && curl -s http://localhost/health')
print(stdout.read().decode())

stdin, stdout, stderr = client.exec_command('docker ps --format "table {{.Names}}\t{{.Status}}" | grep guantou')
print(stdout.read().decode())

client.close()
print('Done!')
