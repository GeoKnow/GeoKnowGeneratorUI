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

import eu.geoknow.generator.component.ComponentManager;
import eu.geoknow.generator.component.beans.Component;
import eu.geoknow.generator.component.beans.Service;
import eu.geoknow.generator.component.beans.ServiceType;
import eu.geoknow.generator.exceptions.ResourceExistsException;
import eu.geoknow.generator.exceptions.ResourceNotFoundException;
import eu.geoknow.generator.exceptions.SPARQLEndpointException;


/**
 * Tests the components manager. This tests requires that a fresh version of Components are loaded
 * in the corresponding graph
 * 
 * @author alejandragarciarojas
 *
 */
public class ComponentManagerTest {

  private static final Logger log = Logger.getLogger(ComponentManagerTest.class);
  private Service service;
  private Component component;

  @Before
  public void init() {

    service = new Service();
    service.setUri("http://testig/component/service");
    service.setDescription("a service");
    service.setServiceUrl("http://testig/component/service");
    service.setType("test");

    component = new Component();
    component.setUri("http://testig/component");
    component.setLabel("label 1");
    component.setWebsite("http://testig/component");
    component.setVersion("1");

    component.getServices().add(service);
  }


  @Test
  public void getComponentsTest() throws IOException, SPARQLEndpointException,
      ResourceNotFoundException {

    Collection<Component> components = ComponentManager.getAllComponents();
    assertFalse(components.isEmpty());
    Component c = components.iterator().next();
    assertFalse(c.getServices().isEmpty());
    Component c2 = ComponentManager.getComponent(c.getUri());
    assertEquals(c.getUri(), c2.getUri());
  }


  @Test
  public void addUpdateDeleteTest() throws SPARQLEndpointException, IOException,
      ResourceExistsException, ResourceNotFoundException {

    // get a unexisitng component
    try {
      ComponentManager.getComponent(component.getUri());
      fail("Should have thrown an ResourceNotFoundException");
    } catch (ResourceNotFoundException e) {
      assertTrue(e instanceof ResourceNotFoundException);
    }

    // insert a component
    log.info("Inserting " + component.getUri());
    ComponentManager.addComponent(component);

    // get a inserted component
    Component c1 = ComponentManager.getComponent(component.getUri());
    assertEquals(c1.getLabel(), component.getLabel());

    // update a component
    c1.setLabel("label 2");
    c1.setVersion("2");
    c1.setWebsite("http://testig2/component");
    c1.getServices().clear();
    log.info("Updating " + c1.getUri());
    ComponentManager.updateComponent(component);

    Component c2 = null;
    c2 = ComponentManager.getComponent(component.getUri());
    assertNotSame(c2.getLabel(), component.getLabel());

    // try to update not existing component
    log.info("Updating unexisting " + c2.getUri());
    c2.setUri("http://testig/2/component");
    try {
      ComponentManager.updateComponent(c2);
      fail("Should have thrown an ResourceNotFoundException");
    } catch (ResourceNotFoundException e) {
      assertTrue(e instanceof ResourceNotFoundException);
    }

    ComponentManager.deleteComponent(component.getUri());

    // try to get the deleted component
    try {
      ComponentManager.getComponent(component.getUri());
      fail("Should have thrown an ResourceNotFoundException");
    } catch (ResourceNotFoundException e) {
      assertTrue(e instanceof ResourceNotFoundException);
    }
  }

  @Test
  public void getAllTypes() throws IOException {

    Collection<ServiceType> all = ComponentManager.getServiceTypes();
    assertFalse(all.isEmpty());
    assertFalse(all.iterator().next().getLabels().isEmpty());

  }
}
