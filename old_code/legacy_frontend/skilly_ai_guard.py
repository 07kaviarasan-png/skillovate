import subprocess
import time
import os
import sys
import requests

def is_running(process_name):
    try:
        # On Windows, tasklist is the standard way to check
        output = subprocess.check_output(['tasklist', '/FI', f'IMAGENAME eq {process_name}'], shell=True).decode()
        return process_name.lower() in output.lower()
    except:
        return False

def check_api_health():
    try:
        # Check if the API is actually responding
        response = requests.get('http://localhost:11434/api/tags', timeout=5)
        return response.status_code == 200
    except:
        return False

def start_skilly_engine():
    print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Skilly AI Engine Health Check Failed. Restarting...", flush=True)
    
    # 1. Kill existing zombies if any
    try:
        subprocess.run(['taskkill', '/F', '/IM', 'ollama.exe', '/T'], 
                      stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, shell=True)
        time.sleep(2)
    except:
        pass

    # 2. Start detached service
    try:
        # Start ollama serve in a new detached process
        subprocess.Popen(['ollama', 'serve'], 
                        creationflags=subprocess.CREATE_NO_WINDOW | subprocess.DETACHED_PROCESS,
                        stdout=subprocess.DEVNULL, 
                        stderr=subprocess.DEVNULL)
        print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Service launched successfully.", flush=True)
    except Exception as e:
        print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] ERROR: Failed to start Skilly AI: {e}", flush=True)

if __name__ == "__main__":
    print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Skilly AI Guard v2.0 Started. Active Health Monitoring enabled.", flush=True)
    
    while True:
        try:
            # Check BOTH process and API health
            if not is_running('ollama.exe') or not check_api_health():
                start_skilly_engine()
                # Wait longer after a restart to allow engine to initialize
                time.sleep(10)
            else:
                # Engine is healthy
                pass
        except Exception as e:
            print(f"Error in Skilly AI guard loop: {e}", flush=True)
            
        time.sleep(10) # Monitor every 10 seconds for Zero-Downtime
