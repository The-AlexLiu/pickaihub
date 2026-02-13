import hashlib
import imagehash
import io
import requests
import xml.etree.ElementTree as ET
from PIL import Image

def analyze_svg(url):
    print(f"\nAnalyzing SVG: {url}")
    try:
        resp = requests.get(url, timeout=10)
        content = resp.content
        
        # Hash of content
        md5 = hashlib.md5(content).hexdigest()
        print(f"  Length: {len(content)}")
        print(f"  MD5: {md5}")
        
        # XML paths
        try:
            root = ET.fromstring(content)
            # Find all path 'd' attributes
            paths = []
            for elem in root.iter():
                # Remove namespace
                tag = elem.tag.split('}')[-1] if '}' in elem.tag else elem.tag
                if tag in ['path', 'polygon', 'rect']:
                    d = elem.attrib.get('d')
                    if d: paths.append(d)
                    
            print(f"  Found {len(paths)} paths.")
            if paths:
                # Use first path as signature
                print(f"  Signature Path[0]: {paths[0][:50]}...")
                return paths
        except Exception as e:
            print(f"  XML Error: {e}")
            
    except Exception as e:
        print(f"  Error: {e}")

def analyze_png(url):
    print(f"\nAnalyzing PNG: {url}")
    try:
        resp = requests.get(url, timeout=10)
        img = Image.open(io.BytesIO(resp.content))
        
        phash = imagehash.phash(img)
        ahash = imagehash.average_hash(img)
        dhash = imagehash.dhash(img)
        
        print(f"  pHash: {phash}")
        print(f"  aHash: {ahash}")
        print(f"  dHash: {dhash}")
        
    except Exception as e:
        print(f"  Error: {e}")

if __name__ == "__main__":
    ref_svg1 = "https://media.theresanaiforthat.com/icons/imagen2-by-google.svg?height=207"
    ref_svg2 = "https://media.theresanaiforthat.com/icons/clever-ai-humanizer.svg?height=207"
    ref_png = "https://media.theresanaiforthat.com/icons/everlyn.png?height=207"
    
    print("--- SVG 1 (Google Imagen) ---")
    paths1 = analyze_svg(ref_svg1)
    
    print("\n--- SVG 2 (Clever AI) ---")
    paths2 = analyze_svg(ref_svg2)
    
    if paths1 and paths2:
        common = set(paths1) & set(paths2)
        print(f"\nCommon Paths: {len(common)}")
        if common:
            print(f"Signature Path: {list(common)[0][:100]}...")
            
    print("\n--- PNG (Everlyn) ---")
    analyze_png(ref_png)
