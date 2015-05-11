package eu.geoknow.generator.component;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotSame;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import java.io.IOException;
import java.util.Collection;

import org.apache.log4j.Logger;
import org.junit.Before;
import org.junit.Test;

import eu.geoknow.generator.component.beans.Component;
import eu.geoknow.generator.component.beans.Service;
import eu.geoknow.generator.component.beans.ServiceType;
import eu.geoknow.generator.configuration.FrameworkConfiguration;
import eu.geoknow.generator.exceptions.InformationMissingException;
import eu.geoknow.generator.exceptions.ResourceExistsException;
import eu.geoknow.generator.exceptions.ResourceNotFoundException;
import eu.geoknow.generator.exceptions.SPARQLEndpointException;


/**
 * Tests the components manager. This tests requires that a fresh version of Components are loaded
 * in the corresponding graph
 * 
 * @author alejandragarciarojas
 * 
 *         TODO: add test to validate user rights to update components, the test is currently using
 *         a super user
 */
public class ComponentManagerIT {

  private static final Logger log = Logger.getLogger(ComponentManagerIT.class);
  private Service service;
  private Component component;

  private ComponentManager manager;

  @Before
  public void init() throws IOException, InformationMissingException {

    service = new Service();
    service.setUri("http://testig/component/service");
    service.setDescription("a service");
    service.setLabel("a service");
    service.setServiceUrl("http://testig/component/service");
    service.setType("test");

    component = new Component();
    component.setUri("http://testig/component");
    component.setLabel("label 1");
    component.setHomepage("http://testig/component");
    component.setVersion("1");

    component.getServices().add(service);

    manager = new ComponentManager(FrameworkConfiguration.getInstance().getSystemRdfStoreManager());

  }


  @Test
  public void getComponentsTest() throws IOException, SPARQLEndpointException,
      ResourceNotFoundException, InformationMissingException {

    log.info("getComponentsTest");
    Collection<Component> components = manager.getAllComponents();
    assertFalse(components.isEmpty());
    Component c = components.iterator().next();
    assertFalse(c.getServices().isEmpty());
    Component c2 = manager.getComponent(c.getUri());
    assertEquals(c.getUri(), c2.getUri());
  }


  @Test
  public void addComponentTest() throws SPARQLEndpointException, IOException,
      ResourceExistsException, ResourceNotFoundException, InformationMissingException {

    // insert a component
    log.info("Inserting " + component.getUri());
    manager.addComponent(component);

    // get a inserted component
    Component c1 = manager.getComponent(component.getUri());
    assertEquals(c1.getLabel(), component.getLabel());

  }

  @Test
  public void updateComponentTest() throws SPARQLEndpointException, IOException,
      ResourceExistsException, ResourceNotFoundException, InformationMissingException {
    // change description

    Component c1 = manager.getComponent(component.getUri());
    c1.setLabel("label 2");
    c1.setVersion("2");
    c1.setHomepage("http://testig2/component");
    manager.updateComponent(c1);

    Component c2 = null;
    c2 = manager.getComponent(component.getUri());
    assertNotSame(c2.getLabel(), component.getLabel());
    assertNotSame(c2.getVersion(), component.getVersion());
    assertNotSame(c2.getHomepage(), component.getHomepage());

    // update services
    c1.getServices().get(0).getProperties().put("user", "anyone");
    c1.getServices().get(0).getProperties().put("password", "hola");
    log.info("Updating " + c1.getServices().get(0).getUri());
    manager.updateComponent(c1);

    Service s1 = manager.getService(c1.getServices().get(0).getUri());
    assertEquals("anyone", s1.getProperties().get("user"));
  }

  @Test
  public void addDeleteTest() throws SPARQLEndpointException, IOException, ResourceExistsException,
      ResourceNotFoundException, InformationMissingException {

    log.info("deleting " + component.getUri());
    manager.deleteComponent(component.getUri());

    // try to update not existing component
    try {
      manager.updateComponent(component);
      fail("Should have thrown an ResourceNotFoundException");
    } catch (ResourceNotFoundException e) {
      assertTrue(e instanceof ResourceNotFoundException);
    }

    // try to get the deleted component
    try {
      manager.getComponent(component.getUri());
      fail("Should have thrown an ResourceNotFoundException");
    } catch (ResourceNotFoundException e) {
      assertTrue(e instanceof ResourceNotFoundException);
    }
  }

  @Test
  public void getAllTypes() throws IOException, InformationMissingException {

    ComponentManager manager =
        new ComponentManager(FrameworkConfiguration.getInstance().getSystemRdfStoreManager());
    Collection<ServiceType> all = manager.getServiceTypes();
    assertFalse(all.isEmpty());
    assertFalse(all.iterator().next().getLabels().isEmpty());

  }
}
