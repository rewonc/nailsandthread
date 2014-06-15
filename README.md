Created by Rewon Child





### Instructions ###

On MacOSX, the following http server is preinstalled:
python -m SimpleHTTPServer

Load the page from localhost:8000/SpecRunner.html

Do not use file:// to open the html file. Loading through file:// will result in CORS issues (cross origin resource sharing) and any canvas images will fail to draw.

To avoid CORS (Cross-origin resource sharing) issues, you need to serve the html and images through an http server. 


