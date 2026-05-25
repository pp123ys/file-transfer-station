import paramiko
import os

host = '43.138.253.185'
user = 'root'
pwd = 'Ys@20041030'
base_local = r'D:\text\file transfer station'
base_remote = '/root/guantou-deploy'

# 需要上传的文件列表
files_to_upload = [
    # 后端
    'backend/.env.example',
    'backend/app/config.py',
    'backend/app/routers/files.py',
    'backend/app/schemas/file.py',
    'backend/app/services/file.py',
    # 前端
    'frontend/src/api/files.js',
    'frontend/src/components/MobileDrawer.jsx',
    'frontend/src/components/Sidebar.jsx',
    'frontend/src/components/UploadModal.jsx',
    'frontend/src/pages/Home.jsx',
    'frontend/src/pages/Profile.jsx',
]

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(host, username=user, password=pwd, timeout=15)

sftp = client.open_sftp()

print('=== 上传文件 ===')
for f in files_to_upload:
    local_path = os.path.join(base_local, f)
    remote_path = f'{base_remote}/{f}'
    # 确保远程目录存在
    remote_dir = os.path.dirname(remote_path)
    try:
        sftp.stat(remote_dir)
    except:
        # 递归创建目录
        dirs = remote_dir.split('/')
        for i in range(2, len(dirs)+1):
            partial = '/'.join(dirs[:i])
            try:
                sftp.stat(partial)
            except:
                sftp.mkdir(partial)
    
    sftp.put(local_path, remote_path)
    print(f'  OK  {f}')

sftp.close()

# 重建前端
print('\n=== 重建前端 ===')
stdin, stdout, stderr = client.exec_command('cd /root/guantou-deploy/frontend && npm install 2>&1 && VITE_API_URL=/api npm run build 2>&1')
print(stdout.read().decode())
err = stderr.read().decode()
if err:
    print('ERR:', err[:500])

# 重建后端
print('=== 重建后端 ===')
stdin, stdout, stderr = client.exec_command('cd /root/guantou-deploy && docker compose build backend 2>&1')
out = stdout.read().decode()
err = stderr.read().decode()
print(out)
if err:
    print('ERR:', err[-1000:])

# 重启
print('=== 重启服务 ===')
stdin, stdout, stderr = client.exec_command('cd /root/guantou-deploy && docker compose up -d 2>&1')
out = stdout.read().decode()
err = stderr.read().decode()
print(out)
if err:
    print('ERR:', err[:500])

# 验证
import time
time.sleep(3)
print('\n=== 验证 ===')
stdin, stdout, stderr = client.exec_command('curl -s http://localhost/health && echo "" && curl -s -o /dev/null -w "前端HTTP: %{http_code}" http://localhost/')
print(stdout.read().decode())

stdin, stdout, stderr = client.exec_command('docker ps --format "table {{.Names}}\t{{.Status}}" | grep guantou')
print(stdout.read().decode())

client.close()
print('\nDone!')
