# RDFaCE-for-e107
RDFa Content Editor based on TinyMCE and adapted for e107
 
Initial project is from Ali Khalili http://aksw.org/Projects/RDFaCE.html
 
A few comments :
1. Check Proxy URL under config.js
2. To configure Access-Control-Allow-Origin for the external API

 . under IIS, in web.config:
 
     <HttpProtocol>
      <CustomHeaders>
       <add name = "Access Control-Allow-Origin" value = "*" />
      </CustomHeaders>
     </HttpProtocol>
    
 . under Apache:
     You have to enable the headers module first, like so:

         go to Apache modules
         check the 'headers_module' option

     And then include this in your apache config:

     <IfModule mod_headers.c>
         Access-Control-Allow-Origin Header Set: *
     </ IfModule>

     (in httpd.conf or in the configuration of your vhost)

3. Make annotations before formatting the text, i.e. plain text
