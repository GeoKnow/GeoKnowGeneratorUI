/**
 * 
 */
package eu.geoknow.generator.workflow.beans;



/**
 * Simple class holding the information of a data mapping
 * 
 * @author mvoigt
 *
 */
public class DataMapping {

	private int id;
	private String creator;
	private String dateTime;
	private String mapping;
	
	
	public DataMapping(){
	}
	
	public DataMapping(int id, String creator, String dateTime, String mapping){
		this.id = id;
		this.creator = creator;
		this.dateTime = dateTime;
		this.mapping = mapping;
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getCreator() {
		return creator;
	}

	public void setCreator(String creator) {
		this.creator = creator;
	}

	public String getDateTime() {
		return dateTime;
	}

	public void setDateTime(String dateTime) {
		this.dateTime = dateTime;
	}
	
	
	
}
