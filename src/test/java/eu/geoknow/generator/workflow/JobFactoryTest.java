package eu.geoknow.generator.workflow;

import static org.junit.Assert.assertTrue;

import org.junit.Test;

import eu.geoknow.generator.workflow.JobFactory;

public class JobFactoryTest {

    @Test
    public void createOneStepServiceJobXmlTest() throws Exception {

        String xml = JobFactory.getInstance().createOneStepServiceJobXml("testXml", "description",
                "http:...", "application/json", "post", "{some:json}");
        assertTrue(xml.startsWith("<?xml version="));

    }
}
