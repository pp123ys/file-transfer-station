import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('43.138.253.185', username='root', password='Ys@20041030', timeout=10)

# npm 可能在别的路径
cmds = [
    'find / -name npm -type f 2>/dev/null | head -5',
    'ls /usr/local/bin/npm 2>/dev/null || echo not-found',
    'ls /usr/local/lib/node_modules/npm/bin/npm-cli.js 2>/dev/null || echo not-found',
    'npm --version 2>&1',
]
for cmd in cmds:
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    print(f'$ {cmd}')
    print(f'  {out}')
    if err:
        print(f'  ERR: {err}')

client.close()
