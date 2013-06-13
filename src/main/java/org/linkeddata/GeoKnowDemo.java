package org.linkeddata;

import com.vaadin.annotations.Theme;
import com.vaadin.server.ExternalResource;
import com.vaadin.server.ThemeResource;
import com.vaadin.server.VaadinRequest;
import com.vaadin.ui.HorizontalLayout;
import com.vaadin.ui.Link;
import com.vaadin.ui.MenuBar;
import com.vaadin.ui.MenuBar.MenuItem;
import com.vaadin.ui.UI;
import com.vaadin.ui.VerticalLayout;

@Theme("geoknow")
@SuppressWarnings("serial")
public class GeoKnowDemo extends UI
{
	private VerticalLayout workspace;
	private VerticalLayout welcome;
	
	private VerticalLayout mainContainer;
    //private VerticalLayout mainContainer;

    @Override
    protected void init(VaadinRequest request) {
    	
    	mainContainer = new VerticalLayout();
    	mainContainer.setStyleName("mainContainer");
        
        HorizontalLayout welcomeContainer = new HorizontalLayout();
        //final AbsoluteLayout welcomeSlagzin = new AbsoluteLayout();
        //welcomeSlagzin.setHeight("75px");
        //welcomeSlagzin.setWidth("400px");
        final Link homepage = new Link();
	    homepage.setResource(new ExternalResource("http://geoknow.eu"));
	    final ThemeResource logo = new ThemeResource("app_images/geoknow-header.jpg");
        homepage.setIcon(logo);
	    homepage.setSizeFull();
        homepage.addStyleName("logo");
        
        welcomeContainer.addComponent(homepage);
        
        final VerticalLayout welcome = new VerticalLayout();
        welcome.addComponent(welcomeContainer);
        this.welcome=welcome;
        welcome.setWidth("100%");
        welcomeContainer.setWidth("100%");
        mainContainer.addComponent(welcome);
        
        HorizontalLayout menubarContainer = new HorizontalLayout();
        menubarContainer.addStyleName("menubarContainer");
        menubarContainer.setWidth("100%");
        
        mainContainer.addComponent(menubarContainer);
        
        MenuBar menubar = new MenuBar();
        menubarContainer.addComponent(menubar);
        
        workspace = new VerticalLayout();
        mainContainer.addComponent(workspace);
        workspace.addStyleName("workspace");
        
        MenuBar.Command mo8c = new MenuBar.Command() {
            public void menuSelected(MenuItem selectedItem) {
                workspace.removeAllComponents();
                CKAN content = new CKAN();
                workspace.addComponent(content);
                content.addStyleName("content");
            }
        };
        
        MenuBar.Command mo9c = new MenuBar.Command() {
            public void menuSelected(MenuItem selectedItem) {
                workspace.removeAllComponents();
                CKANAPI content = new CKANAPI();
                workspace.addComponent(content);
                content.addStyleName("content");
            }
        };
        
        MenuBar.MenuItem onlinetools  = menubar.addItem("Online Tools & Services", null, null);
        MenuBar.MenuItem ckan      	  = onlinetools.addItem("CKAN", null, mo8c);
        MenuBar.MenuItem ckanapi      = onlinetools.addItem("CKAN API", null, mo9c);
        menubar.setWidth("100%");
        
        setContent(mainContainer);
        
    }

}
