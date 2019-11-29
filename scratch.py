from tesserocr import PyTessBaseAPI
import os
# from PIL import Image
import sys

print("Output from Python")
print("First name: " + sys.argv[1])
print("Last name: " + sys.argv[2])
path = os.getcwd()
print(path+sys.argv[1])

# column = Image.open(path+sys.argv[1])

# Image preprocessing
# gray = column.convert('L')
# blackwhite = gray.point(lambda x: 0 if x < 250 else 255, '1')
# blackwhite.save('inc_bw.jpeg')

pathToTessdata = path + '\\tesserocr-master\\tessdata\\.'
with PyTessBaseAPI(path=pathToTessdata, lang='eng') as api:
    api.SetImageFile(path+sys.argv[1])
    print(api.GetUTF8Text())
