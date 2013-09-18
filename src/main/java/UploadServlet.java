import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.PrintWriter;
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

public class UploadServlet extends HttpServlet {

   private static final long serialVersionUID = 1L;
   private String filePath;
   private String tempData;
   private int maxFileSize = 50 * 1024;
   private int maxMemSize = 4 * 1024;
   

   public void init( ){
      // Get the file location where it would be stored.
      filePath = getServletContext().getInitParameter("file-upload"); 
      maxFileSize = Integer.parseInt(getServletContext().getInitParameter("max-file-size")); 
      maxMemSize = Integer.parseInt(getServletContext().getInitParameter("max-mem-size"));
      tempData = getServletContext().getInitParameter("temp-data");
   }
   
   public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
      doPost(request, response);
   }

   public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
      response.setContentType("text/html");
      PrintWriter out = response.getWriter();

      boolean isMultipartContent = ServletFileUpload.isMultipartContent(request);
      if (!isMultipartContent) {
         out.println("Not a file.");
         return;
      }
     
      // Directory where files will be saved
      ServletContext servletContext = getServletContext();
      File seshdir = new File(servletContext.getRealPath(File.separator) + filePath);
      
      if (!seshdir.exists()) {
       seshdir.mkdirs();
      }
      
      File tmpDataDir = new File(tempData);
      if (!tmpDataDir.exists()) {
    	  tmpDataDir.mkdirs();
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
            out.println("No fields found");
            return;
         }
         
         for (FileItem diskFileItem : fields) {
       	   // Exclude the form fields
       	   if (diskFileItem.isFormField()) {
       	    continue;
       	   }
       	   
//       	   out.println("<td>file form field</td><td>FIELD NAME: " + diskFileItem.getFieldName() +
//                "<br/>STRING: " + diskFileItem.getString() +
//                "<br/>NAME: " + diskFileItem.getName() +
//                "<br/>CONTENT TYPE: " + diskFileItem.getContentType() +
//                "<br/>SIZE (BYTES): " + diskFileItem.getSize() +
//                "<br/>TO STRING: " + diskFileItem.toString()
//                );

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
             e.printStackTrace(System.err);
           }  
           
           out.println("Successfuly uploaded "+seshdir + File.separator+ diskFileItem.getName());
         }
         
      } catch (FileUploadException e) {
         e.printStackTrace();
      }
   }
}