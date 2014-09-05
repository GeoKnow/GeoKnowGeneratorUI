package rdf;

import authentication.web.HttpRequestManager;

public class SecureRdfStoreManagerImpl extends RdfStoreManagerImpl {
    private String username;
    private String password;

    public SecureRdfStoreManagerImpl(String endpoint, String username, String password) {
        super(endpoint);
        this.username = username;
        this.password = password;
    }

    protected String executePost(String endpoint, String urlParameters) throws Exception{
        return HttpRequestManager.executePost(endpoint, urlParameters, username, password);
    }
}
