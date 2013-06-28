package org.linkeddata;

import com.vaadin.annotations.Theme;
import com.vaadin.server.ExternalResource;
import com.vaadin.server.Resource;
import com.vaadin.server.ThemeResource;
import com.vaadin.server.VaadinRequest;
import com.vaadin.shared.ui.label.ContentMode;
import com.vaadin.ui.AbsoluteLayout;
import com.vaadin.ui.Alignment;
import com.vaadin.ui.Button;
import com.vaadin.ui.Button.ClickEvent;
import com.vaadin.ui.HorizontalLayout;
import com.vaadin.ui.Image;
import com.vaadin.ui.Label;
import com.vaadin.ui.Link;
import com.vaadin.ui.MenuBar;
import com.vaadin.ui.MenuBar.MenuItem;
import com.vaadin.ui.UI;
import com.vaadin.ui.VerticalLayout;
import com.vaadin.ui.themes.BaseTheme;

@Theme("geoknow")
@SuppressWarnings("serial")
public class GeoKnowDemo extends UI
{
	
	private GeoKnowDemoState state;
	
	private VerticalLayout workspace;
	private VerticalLayout welcome;
	
	private VerticalLayout mainContainer;
    //private VerticalLayout mainContainer;

    @Override
    protected void init(VaadinRequest request) {
    	
    	state = new GeoKnowDemoState();
    	
    	mainContainer = new VerticalLayout();
    	mainContainer.setStyleName("mainContainer");
        
        HorizontalLayout welcomeContainer = new HorizontalLayout();
        
        final AbsoluteLayout welcomeLogo = new AbsoluteLayout();
        welcomeLogo.setWidth("300px");
        welcomeLogo.setHeight("75px");
        welcomeLogo.addStyleName("welcomeLogo");
        
        final Link homepage = new Link();
	    homepage.setResource(new ExternalResource("http://geoknow.eu"));
	    final ThemeResource logo = new ThemeResource("app_images/geoknow-header.jpg");
        homepage.setIcon(logo);
        homepage.setSizeFull();
        homepage.addStyleName("logo");
        
        Button homeb = new Button("Home");
        homeb.addClickListener(new Button.ClickListener() {
            public void buttonClick(ClickEvent event) {
                home();
            }
        });
        homeb.setStyleName(BaseTheme.BUTTON_LINK);
        homeb.addStyleName("homeb");
        
        welcomeLogo.addComponent(homepage);
        welcomeContainer.addComponent(welcomeLogo);
        welcomeContainer.addComponent(homeb);
        welcomeContainer.setComponentAlignment(welcomeLogo, Alignment.TOP_LEFT);
        welcomeContainer.setComponentAlignment(homeb, Alignment.TOP_RIGHT);
        
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
        
        MenuBar.Command me3c = new MenuBar.Command() {
            public void menuSelected(MenuItem selectedItem) {
                workspace.removeAllComponents();
                EXML me3c_content = new EXML(state);
                workspace.addComponent(me3c_content);
                me3c_content.addStyleName("me3c_content");
            }  
        };
        
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
        
        MenuBar.MenuItem extraction  = menubar.addItem("Extraction & Loading", null, null);
        MenuBar.MenuItem exml      	  = extraction.addItem("Extract RDF from XML", null, me3c);
        
        MenuBar.MenuItem onlinetools  = menubar.addItem("Online Tools & Services", null, null);
        MenuBar.MenuItem ckan      	  = onlinetools.addItem("CKAN", null, mo8c);
        MenuBar.MenuItem ckanapi      = onlinetools.addItem("CKAN API", null, mo9c);
        menubar.setWidth("100%");
        
        setContent(mainContainer);
        home();
        
    }
    
    private String introtext = 
            "<p>This is version 1.0 of the GeoKnow Generator, which comprises a number of tools " +
            "for managing Geospatial information. In particular " + 
            "the following functions are to be supported:" +
            "</p><p>" + 
            "<ul>" + 
            "<li>Efficient geospatial RDF querying</li>" + 
            "<li>Fusion and aggregation of geospatial RDF data</li>" + 
            "<li>Visualisation and authoring</li>" + 
            "<li>Working with and combining public-private geospatial data</li>" + 
            "</ul>" + 
            "</p><p>" + 
            "You can access tools for each of these functions using the above menu." + 
            "</p><p>" + 
            "The GeoKnow Generator and tools are developed by the GeoKnow project consortium comprising 6 " + 
            "research groups and companies. The GeoKnow project is co-funded by the" + 
            "European Commission within the 7th Framework Programme (GA no. 318159)." + 
            "</p><p>" + 
            "You can find further information about the GeoKnow Generator at <a href=\"http://stack.linkeddata.org\">http://stack.linkeddata.org</a> " +
            "and the GeoKnow project at <a href=\"http://geoknow.eu\">http://geoknow.eu</a>." +
            "<p>";
    
    private String funding = 
            "<h2>Funded by</h2>";
    
    public void home() {
        workspace.removeAllComponents();
        workspace.setHeight("80%");

        HorizontalLayout introH = new HorizontalLayout();

        VerticalLayout introV =  new VerticalLayout();
        introV.setStyleName("introV");
        introH.addComponent(introV);
        introH.setComponentAlignment(introV, Alignment.TOP_LEFT);

        Label introtextl =  new Label(introtext);
        introtextl.setContentMode(ContentMode.HTML);
        
        introV.addComponent(introtextl);
        introtextl.setWidth("600px");

        VerticalLayout introVH =  new VerticalLayout();
        HorizontalLayout EU =  new HorizontalLayout();
        introH.addComponent(introVH);
        
        Label funding1 =  new Label(funding);
        funding1.setContentMode(ContentMode.HTML);
        funding1.setWidth("240px");
        
        introVH.addComponent(funding1);
        
        Resource eu = new ThemeResource("app_images/eu-flag.gif");
        Image euflag = new Image(null, eu);
        EU.addComponent(euflag);
        euflag.addStyleName("eugif");
        euflag.setHeight("70px");
        Resource fp = new ThemeResource("app_images/fp7-gen-rgb_small.gif");
        Image fp7 = new Image(null, fp);
        fp7.addStyleName("eugif");
        fp7.setHeight("70px");
        EU.addComponent(fp7);
        
        introVH.addComponent(EU);
        workspace.addComponent(introH);
    }

}
