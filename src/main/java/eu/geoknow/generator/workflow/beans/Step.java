/**
 * 
 */
package eu.geoknow.generator.workflow.beans;

/**
 * A single step in a workflow - used as POJO
 * @author mvoigt
 *
 */
public class Step {
	
    private String service;
    private String contenttype;
    private String method;
    private String body;
    private int numberOfOrder;
    
    public Step(){
    	
    }
    
    public Step(String service, String contenttype, String method, String body, int numberOfOrder){
    	this.service = service;
    	this.body = body;
    	this.contenttype = contenttype;
    	this.method = method;
    	this.numberOfOrder = numberOfOrder;
    }

	public String getService() {
		return service;
	}

	public void setService(String service) {
		this.service = service;
	}

	public String getContenttype() {
		return contenttype;
	}

	public void setContenttype(String contenttype) {
		this.contenttype = contenttype;
	}

	public String getMethod() {
		return method;
	}

	public void setMethod(String method) {
		this.method = method;
	}

	public String getBody() {
		return body;
	}

	public void setBody(String body) {
		this.body = body;
	}

	public int getNumberOfOrder() {
		return numberOfOrder;
	}

	public void setNumberOfOrder(int numberOfOrder) {
		this.numberOfOrder = numberOfOrder;
	}

    
}
