
import subprocess
import sys
import platform
import os

def install_tesseract():
    """Install Tesseract OCR based on the operating system"""
    system = platform.system().lower()
    
    print(f"Detected system: {system}")
    
    if system == "linux":
        print("Installing Tesseract for Linux...")
        try:
            subprocess.run(["sudo", "apt-get", "update"], check=True)
            subprocess.run(["sudo", "apt-get", "install", "-y", "tesseract-ocr"], check=True)
            print("✓ Tesseract installed successfully on Linux")
        except subprocess.CalledProcessError:
            print("❌ Failed to install Tesseract on Linux")
            print("Please run: sudo apt-get install tesseract-ocr")
    
    elif system == "darwin":  # macOS
        print("Installing Tesseract for macOS...")
        try:
            subprocess.run(["brew", "install", "tesseract"], check=True)
            print("✓ Tesseract installed successfully on macOS")
        except subprocess.CalledProcessError:
            print("❌ Failed to install Tesseract on macOS")
            print("Please install Homebrew and run: brew install tesseract")
    
    elif system == "windows":
        print("For Windows, please download and install Tesseract manually:")
        print("1. Download from: https://github.com/UB-Mannheim/tesseract/wiki")
        print("2. Install the executable")
        print("3. Add Tesseract to your PATH or set TESSERACT_CMD environment variable")
    
    else:
        print(f"Unsupported system: {system}")
        print("Please install Tesseract OCR manually")

def install_python_packages():
    """Install Python packages from requirements.txt"""
    print("Installing Python packages...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], check=True)
        print("✓ Python packages installed successfully")
    except subprocess.CalledProcessError:
        print("❌ Failed to install Python packages")
        return False
    return True

def create_directories():
    """Create necessary directories"""
    directories = ["uploads", "logs"]
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"✓ Created directory: {directory}")

def main():
    """Main setup function"""
    print("=== Mini-CRM Backend Setup ===")
    print()
    
    # Create directories
    create_directories()
    
    # Install Python packages
    if not install_python_packages():
        return
    
    # Install Tesseract
    install_tesseract()
    
    print()
    print("=== Setup Complete ===")
    print("To start the server, run:")
    print("  python main.py")
    print("Or:")
    print("  uvicorn main:app --reload --host 0.0.0.0 --port 8000")
    print()
    print("API will be available at: http://localhost:8000")
    print("API documentation: http://localhost:8000/docs")

if __name__ == "__main__":
    main()
