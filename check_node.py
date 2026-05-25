import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('43.138.253.185', username='root', password='Ys@20041030', timeout=10)

stdin, stdout, stderr = client.exec_command('which node && node --version && which npm && npm --version')
print(stdout.read().decode())
err = stderr.read().decode()
if err:
    print('ERR:', err)

client.close()
