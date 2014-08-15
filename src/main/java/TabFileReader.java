import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;

public class TabFileReader extends HttpServlet {
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	
	public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
	      doPost(request, response);
	}

	public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
		response.setHeader("Access-Control-Allow-Origin", "*");

		response.setContentType("application/json");
		PrintWriter out = response.getWriter();
		
		String filePath = getServletContext().getRealPath(File.separator);
		
		// Replace the name of the generator servlet, so that the TAB output file can be loaded
		filePath = filePath.replace("generator/", "");
		filePath = filePath.replace("ontos-lds-ALL/", "");
		//filePath = "file:///"+filePath.replace("\\", "/");
		//filePath = filePath.replace(" ", "%20");
		
		BufferedReader br = null;
		List<String> review = new ArrayList<String>();
		List<String> accepted = new ArrayList<String>();
		 
		try {
 
			String sCurrentLine;
			
			br = new BufferedReader(new FileReader(filePath+"Limes-Service/result"+ File.separator + "accepted.nt"));
 
			while ((sCurrentLine = br.readLine()) != null) {
				accepted.add(sCurrentLine);
			}
			
			br.close();
			
			br = null;
			br = new BufferedReader(new FileReader(filePath+"Limes-Service/result"+ File.separator + "reviewme.nt"));
			 
			while ((sCurrentLine = br.readLine()) != null) {
				review.add(sCurrentLine);
			}
 
		} catch (IOException e) {
			e.printStackTrace();
		} finally {
			try {
				if (br != null)br.close();
			} catch (IOException ex) {
				ex.printStackTrace();
			}
		}
		
		Object[] all = new Object[2];
		
		all[0] = review.toArray();
		all[1] = accepted.toArray();
		
		Gson gson = new Gson();
	    String json = gson.toJson(all);
	    response.setContentType("application/json");
	    response.setCharacterEncoding("UTF-8");
	    response.getWriter().write(json);
		
	}

}
