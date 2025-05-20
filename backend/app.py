import os
import requests
import json
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import base64
import re

# .env dosyasından çevresel değişkenleri yükle
load_dotenv()

# API anahtarını çevresel değişkenden al
FASHN_API_KEY = os.getenv("FASHN_API_KEY")
if not FASHN_API_KEY:
    raise ValueError("FASHN_API_KEY çevresel değişkeni ayarlanmamış")

# Fashn.ai API endpoint'leri
FASHN_API_BASE_URL = "https://api.fashn.ai/v1"
FASHN_API_NIGHTLY_URL = "https://api.fashn.ai/nightly"

app = Flask(__name__, static_folder="../frontend") 
CORS(app)  # CORS desteği ekle

# Base64 veri URL'sinden base64 dizesini çıkar
def extract_base64_from_data_url(data_url):
    match = re.match(r'data:image/\w+;base64,(.*)', data_url)
    if match:
        return match.group(1)
    return data_url

# Görüntü URL'sini veya base64'ü işle
def process_image(image_data):
    # Eğer URL ise, doğrudan döndür
    if image_data.startswith('http') :
        return image_data
    
    # Eğer base64 ise, doğru formatta olduğundan emin ol
    if 'base64' in image_data:
        # Zaten doğru formatta, doğrudan döndür
        return image_data
    else:
        # Base64 öneki ekle
        return f"data:image/jpeg;base64,{image_data}"

# Ana sayfa (Yeni Landing Page)
@app.route('/')
def index():
    # app.static_folder frontend klasörüne ayarlı olmalı
    return send_from_directory(app.static_folder, 'index.html')

# Sanal Deneme Sayfası
@app.route('/tryon')
def tryon_page():
    # app.static_folder frontend klasörüne ayarlı olmalı
    return send_from_directory(app.static_folder, 'tryon.html')

# Statik dosyalar (CSS, JS vb. frontend klasöründen)
@app.route('/<path:path>')
def static_files(path):
    return send_from_directory(app.static_folder, path)

# Sanal giysi deneme endpoint'i
@app.route('/api/tryon', methods=['POST'])
def tryon():
    try:
        # İstek verilerini al
        data = request.json
        
        # Zorunlu parametreleri kontrol et
        if 'model_image' not in data or 'garment_image' not in data:
            return jsonify({'error': 'model_image ve garment_image parametreleri gereklidir'}), 400
        
        # Görüntüleri işle
        model_image = process_image(data['model_image'])
        garment_image = process_image(data['garment_image'])
        
        # Fashn.ai API'sine gönderilecek verileri hazırla
        api_data = {
            'model_image': model_image,
            'garment_image': garment_image,
            'category': data.get('category', 'auto'),
            'mode': data.get('mode', 'balanced')
        }
        
        # İsteğe bağlı parametreleri ekle
        optional_params = ['cover_feet', 'adjust_hands', 'restore_background', 
                          'restore_clothes', 'long_top', 'garment_photo_type', 
                          'seed', 'num_samples', 'moderation_level']
        
        for param in optional_params:
            if param in data:
                api_data[param] = data[param]
        
        # Fashn.ai API'sine istek gönder
        response = requests.post(
            f"{FASHN_API_BASE_URL}/run",
            json=api_data,
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {FASHN_API_KEY}'
            }
        )
        
        # Yanıtı kontrol et
        response.raise_for_status()
        
        # API yanıtını döndür
        return jsonify(response.json())
    
    except requests.exceptions.RequestException as e:
        # API isteği hatası
        error_message = str(e)
        try:
            error_json = e.response.json()
            if 'error' in error_json:
                error_message = error_json['error'].get('message', str(e))
        except:
            pass
        
        return jsonify({'error': f'API isteği başarısız oldu: {error_message}'}), 500
    
    except Exception as e:
        # Genel hata
        return jsonify({'error': f'Bir hata oluştu: {str(e)}'}), 500

# Tahmin durumu endpoint'i
@app.route('/api/tryon/status/<prediction_id>', methods=['GET'])
def tryon_status(prediction_id):
    try:
        # Fashn.ai API'sine istek gönder
        response = requests.get(
            f"{FASHN_API_BASE_URL}/status/{prediction_id}",
            headers={
                'Authorization': f'Bearer {FASHN_API_KEY}'
            }
        )
        
        # Yanıtı kontrol et
        response.raise_for_status()
        
        # API yanıtını döndür
        return jsonify(response.json())
    
    except requests.exceptions.RequestException as e:
        # API isteği hatası
        error_message = str(e)
        try:
            error_json = e.response.json()
            if 'error' in error_json:
                error_message = error_json['error'].get('message', str(e))
        except:
            pass
        
        return jsonify({'error': f'API isteği başarısız oldu: {error_message}'}), 500
    
    except Exception as e:
        # Genel hata
        return jsonify({'error': f'Bir hata oluştu: {str(e)}'}), 500

# Nightly API için sanal giysi deneme endpoint'i
@app.route('/api/tryon/nightly', methods=['POST'])
def tryon_nightly():
    try:
        # İstek verilerini al
        data = request.json
        
        # Zorunlu parametreleri kontrol et
        if 'model_image' not in data or 'garment_image' not in data:
            return jsonify({'error': 'model_image ve garment_image parametreleri gereklidir'}), 400
        
        # Görüntüleri işle
        model_image = process_image(data['model_image'])
        garment_image = process_image(data['garment_image'])
        
        # Fashn.ai API'sine gönderilecek verileri hazırla
        api_data = {
            'model_image': model_image,
            'garment_image': garment_image,
            'category': data.get('category', 'auto'),
            'mode': data.get('mode', 'balanced')
        }
        
        # İsteğe bağlı parametreleri ekle
        optional_params = ['segmentation_free', 'garment_photo_type', 
                          'seed', 'num_samples', 'moderation_level']
        
        for param in optional_params:
            if param in data:
                api_data[param] = data[param]
        
        # Fashn.ai Nightly API'sine istek gönder
        response = requests.post(
            f"{FASHN_API_NIGHTLY_URL}/run",
            json=api_data,
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {FASHN_API_KEY}'
            }
        )
        
        # Yanıtı kontrol et
        response.raise_for_status()
        
        # API yanıtını döndür
        return jsonify(response.json())
    
    except requests.exceptions.RequestException as e:
        # API isteği hatası
        error_message = str(e)
        try:
            error_json = e.response.json()
            if 'error' in error_json:
                error_message = error_json['error'].get('message', str(e))
        except:
            pass
        
        return jsonify({'error': f'API isteği başarısız oldu: {error_message}'}), 500
    
    except Exception as e:
        # Genel hata
        return jsonify({'error': f'Bir hata oluştu: {str(e)}'}), 500

# Nightly API için tahmin durumu endpoint'i
@app.route('/api/tryon/nightly/status/<prediction_id>', methods=['GET'])
def tryon_nightly_status(prediction_id):
    try:
        # Fashn.ai Nightly API'sine istek gönder
        response = requests.get(
            f"{FASHN_API_NIGHTLY_URL}/status/{prediction_id}",
            headers={
                'Authorization': f'Bearer {FASHN_API_KEY}'
            }
        )
        
        # Yanıtı kontrol et
        response.raise_for_status()
        
        # API yanıtını döndür
        return jsonify(response.json())
    
    except requests.exceptions.RequestException as e:
        # API isteği hatası
        error_message = str(e)
        try:
            error_json = e.response.json()
            if 'error' in error_json:
                error_message = error_json['error'].get('message', str(e))
        except:
            pass
        
        return jsonify({'error': f'API isteği başarısız oldu: {error_message}'}), 500
    
    except Exception as e:
        # Genel hata
        return jsonify({'error': f'Bir hata oluştu: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
