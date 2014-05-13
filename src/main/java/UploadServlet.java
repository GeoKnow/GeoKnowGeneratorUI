import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.codehaus.jackson.map.ObjectMapper;

import util.JsonResponse;

public class UploadServlet extends HttpServlet {

   private static final long serialVersionUID = 1L;
   private String filePath;
   private String tempData;
   private int maxFileSize = 1024 * 1024;
   private int maxMemSize = 4 * 1024;
   

   public void init( ){
      // Get the file location where it would be stored.
      filePath = getServletContext().getInitParameter("file-upload"); 
      maxFileSize = Integer.parseInt(getServletContext().getInitParameter("max-file-size")); 
      maxMemSize = Integer.parseInt(getServletContext().getInitParameter("max-mem-size"));
      tempData = getServletContext().getInitParameter("temp-data");
   }
   
   public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
      
	  response.setContentType("application/json");
      PrintWriter out = response.getWriter();

      JsonResponse res = new JsonResponse();
      ObjectMapper mapper = new ObjectMapper();
      
      boolean isMultipartContent = ServletFileUpload.isMultipartContent(request);
      if (!isMultipartContent) {
    	 res.setStatus("FAIL");
         res.setMessage("Not a file.");
         mapper.writeValue(out, res); 
   	     out.close();
         return;
      }
     
      // Directory where files will be saved
      ServletContext servletContext = getServletContext();
      
      File tmpDataDir = new File(servletContext.getRealPath(File.separator) + tempData);
      if (!tmpDataDir.exists()) {
    	  tmpDataDir.mkdirs();
      }
      
      File seshdir = new File(servletContext.getRealPath(File.separator) + filePath);
      if (!seshdir.exists()) {
       seshdir.mkdirs();
      }  
      
      DiskFileItemFactory factory = new DiskFileItemFactory();
      // maximum size that will be stored in memory
      factory.setSizeThreshold(maxMemSize);
      // Location to save data that is larger than maxMemSize.
      factory.setRepository(tmpDataDir);
      
      ServletFileUpload upload = new ServletFileUpload(factory);
      // maximum file size to be uploaded.
      upload.setSizeMax( maxFileSize );    
      try {
         List<FileItem> fields = upload.parseRequest(request);

         Iterator<FileItem> it = fields.iterator();
         if (!it.hasNext()) {
            res.setStatus("FAIL");
            res.setMessage("No fields found");
            mapper.writeValue(out, res); 
      	  	out.close();
            return;
         }
         
         
         for (FileItem diskFileItem : fields) {
       	   // Exclude the form fields
       	   if (diskFileItem.isFormField()) {
       	    continue;
       	   }
       	   
       	   byte[] fileBytes = diskFileItem.get();
       	   File file = new File(seshdir, diskFileItem.getName());
       	   if(!file.exists()) 
    		   file.createNewFile();
    	   
           try {
        	   FileOutputStream fileOutputStream = new FileOutputStream(file);
           	   fileOutputStream.write(fileBytes);
           	   fileOutputStream.flush();
           	   fileOutputStream.close();
           	   
           	   
           } catch (FileNotFoundException e) {
        	   res.setStatus("FAIL");
               res.setMessage(e.getMessage());
               return;
           }  
           
           res.addResult(file.getAbsolutePath()+file.getName());
         }
         res.setStatus("SUCESS");
         res.setMessage("Successfuly uploaded");
         
      } catch (FileUploadException e) {
    	  res.setStatus("FAIL");
          res.setMessage(e.getMessage());
      }
      
	  mapper.writeValue(out, res); 
	  out.close();
   }
}