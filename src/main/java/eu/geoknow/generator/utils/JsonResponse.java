package eu.geoknow.generator.utils;
import java.util.ArrayList;
import java.util.List;



public class JsonResponse {

	private String status = null;
	private String message = null;
    private List<String> result = new ArrayList<String>();

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
    public List<String> getResult() {
        return result;
    }
    public void addResult(String result) {
        this.result.add(result);
    }

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}
}
