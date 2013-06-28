package org.linkeddata.slimvaliant;

import com.googlecode.sardine.DavResource;
import com.googlecode.sardine.Sardine;
import com.googlecode.sardine.SardineFactory;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Created by IntelliJ IDEA.
 * User: Johan.De-Smedt
 * Date: Aug 15, 2011
 * Time: 3:21:59 PM
 */
public class Reader {
   private String host = "";
   private String url = "";
   private String filenameRegex = "";
   private int next = 0;
   private int max = Integer.MAX_VALUE;
   private Sardine sardine;
   private List<DavResource> resources = null;
   private Pattern pattern;
   Reader(String host, String url, String regex, int max, String user, String password) throws Exception {
       if (url.length() == 0) throw new Exception("Zero length reader URL.");
       this.host = host;
       if (this.url.length() == 0) {
           this.url = url;
       }
       if (regex.length() > 0) {
           this.filenameRegex = regex;
           this.pattern = Pattern.compile(regex); 
       }
       if (max >= 0) this.max = max;
       this.sardine = SardineFactory.begin(user, password);
       this.resources = this.sardine.list(this.host + this.url);
       System.out.println("count of found resources: " + resources.size());
   }

   public DavResource getNext() {
       if (resources == null) return null;
       if (resources.size() <= next) return null;
       DavResource res = (DavResource) this.resources.get(next);
       next++;
       return res;
   }

   public void reset() { this.next = 0; }

   public int size() {
       if (resources == null) return 0;
       return this.resources.size();
   }

   public int pos() { return this.next; }

   private boolean match() {
       if (this.resources == null) return false;
       if (this.resources.size() == 0) return false;
       if (this.resources.size() <= this.next) return false;
       if (this.filenameRegex.length() == 0) return true;
       String name = ((DavResource) this.resources.get(next)).getName();
       Matcher m = pattern.matcher(name);
       return m.matches();
   }

   public DavResource nextMatch() {
       DavResource res = null;
       for(; this.next < this.resources.size(); this.next++) {
           if (this.match()) {
               res = this.getNext();
               break;
           }
       }
       //System.out.println("currently on " + this.next);
       return res;
   }

   public InputStream getStream(DavResource res) throws Exception {
       try {
           String path = res.getPath();
           return this.sardine.get(this.host + path);
       } catch (IOException e) {
           e.printStackTrace();
           throw new Exception("Failed to retrieve " + res.getPath());
       }
   }

   public void putStream(String name, InputStream input) {
       try {
           this.sardine.put(this.host + "/DAV/home/wkd/rdf_xml/" + name, input, "application/rdf+xml");
       } catch (Exception e) {
           e.printStackTrace();
       }
   }
}
