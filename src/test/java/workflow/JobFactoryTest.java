package workflow;

import static org.junit.Assert.assertTrue;

import org.junit.Test;

public class JobFactoryTest {

    @Test
    public void createOneStepServiceJobXmlTest() throws Exception {

        JobFactory.getInstance();
        String xml = JobFactory.createOneStepServiceJobXml("testXml", "description", "http:...",
                "application/json", "post", "{some:json}");
        assertTrue(xml.startsWith("<?xml version="));

    }
}
