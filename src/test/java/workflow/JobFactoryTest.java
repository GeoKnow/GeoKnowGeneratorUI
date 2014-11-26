package workflow;

import static org.junit.Assert.assertTrue;

import java.io.File;
import java.io.IOException;

import javax.xml.bind.JAXBException;

import org.junit.Test;

public class JobFactoryTest {

    @Test
    public void createOneStepServiceJobTest() throws JAXBException, IOException {

        JobFactory.getInstance();
        File file = JobFactory.createOneStepServiceJobFile("test", "description", "http:...",
                "application/json", "post", "{some:json}");
        assertTrue(file.exists());

    }
}
