// http://www.mkyong.com/webservices/jax-rs/restful-java-client-with-apache-httpclient/

package org.linkeddata;


import java.io.*;
import java.util.ArrayList;
import java.util.Iterator;


import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.client.methods.*;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import com.vaadin.ui.*;
import com.vaadin.ui.Button.ClickEvent;

/**
 * CKAN: the collection of datasets 
 */
//@SuppressWarnings("serial")
public class CKANAPI extends CustomComponent{
	
	
	
	public CKANAPI(){
		
		final VerticalLayout layout = new VerticalLayout();
		
		layout.setMargin(true);

		final TextField tf = new TextField();
		Button button = new Button("Search CKAN");
		Label label;
		button.addClickListener(new Button.ClickListener() {
			public void buttonClick(ClickEvent event) {
				String searchTerm = (String) tf.getValue();
				//layout.addComponent(new Label(get(searchTerm)));
				
				JSONParser parser = new JSONParser();
				Object obj;
				
				try {
					obj = parser.parse(get(searchTerm));
					JSONObject jsonObject = (JSONObject) obj;
					boolean success = (Boolean) jsonObject.get("success");
					if(success==true){
						JSONObject result = (JSONObject) jsonObject.get("result");
						JSONArray results = (JSONArray) result.get("results");
						
						for(int i = 0; i<results.size(); i++){
							JSONObject jsonObject1 = (JSONObject)results.get(i);
							JSONArray resource = (JSONArray) jsonObject1.get("resources");
							JSONObject jsonObject2 = (JSONObject)resource.get(0);
							Object state = jsonObject2.get("state");
							Object format = jsonObject2.get("format");
							Object url = jsonObject2.get("url");
						
							//layout.addComponent(new Label(jsonObject1.toString()));
							layout.addComponents(new Label(url.toString()),new Label(state.toString()),new Label(format.toString()));
						}
					}
				} catch (ParseException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
				
				layout.markAsDirty();
			}
		});
		
		layout.addComponent(tf);
		layout.addComponent(button);
		
		// The composition root MUST be set
		setCompositionRoot(layout);
		
	}
	
		public static String get(String searchTerm) {
			
			String reply = null;

			try {
				 
				DefaultHttpClient httpClient = new DefaultHttpClient();
				HttpGet getRequest = new HttpGet(
					"http://demo.ckan.org/api/3/action/package_search?q="+searchTerm);
				getRequest.addHeader("accept", "application/json");
		 
				HttpResponse response = httpClient.execute(getRequest);
		 
				if (response.getStatusLine().getStatusCode() != 200) {
					throw new RuntimeException("Failed : HTTP error code : "
					   + response.getStatusLine().getStatusCode());
				}
		 
				BufferedReader br = new BufferedReader(
		                         new InputStreamReader((response.getEntity().getContent())));
		 
				String output;
				//System.out.println("Output from Server .... \n");
				while ((output = br.readLine()) != null) {
					//System.out.println(output);
					reply = output;
				}
				httpClient.getConnectionManager().shutdown();
		 
			  } catch (ClientProtocolException e) {
		 
				e.printStackTrace();
		 
			  } catch (IOException e) {
		 
				e.printStackTrace();
			  }
			return reply;
		 
			}
		
		// propagate the information of one tab to another.
		public void setDefaults() {
		};
			
}