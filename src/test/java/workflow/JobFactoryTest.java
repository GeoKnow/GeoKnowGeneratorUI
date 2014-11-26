package workflow;

import static org.junit.Assert.assertTrue;

import java.io.File;

import org.junit.Test;

public class JobFactoryTest {

    @Test
    public void createOneStepServiceJobTest() throws Exception {

        JobFactory.getInstance();
        File file = JobFactory.createOneStepServiceJobFile("test", "description", "http:...",
                "application/json", "post", "{some:json}");
        assertTrue(file.exists());

    }
}
