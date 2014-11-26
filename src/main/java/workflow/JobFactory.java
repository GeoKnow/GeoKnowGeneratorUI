package workflow;

import java.io.File;
import java.io.IOException;
import java.io.StringWriter;
import java.net.URLDecoder;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;

import org.apache.log4j.Logger;
import org.springframework.schema.batch.Job;
import org.springframework.schema.batch.ObjectFactory;
import org.springframework.schema.batch.TaskletType;
import org.springframework.schema.beans.Bean;
import org.springframework.schema.beans.Beans;

import workflow.beans.OneStepServiceJob;

/**
 * This class is used to create spring batch jobs definitions. This class is to
 * be extended to be able to generate workflows of several steps.
 * 
 * @author alejandragarciarojas
 *
 */
public class JobFactory {

    private static final Logger log = Logger.getLogger(JobFactory.class);

    private static org.springframework.schema.batch.ObjectFactory batchFactory;
    private static org.springframework.schema.beans.ObjectFactory beanFactory;

    // TODO: this directory should stay outside of the webappp
    private static String files_dir = "/etc/generator/batch-jobs";

    private static JobFactory instance;

    public static JobFactory getInstance() throws Exception {

        if (instance != null)
            return instance;

        batchFactory = new org.springframework.schema.batch.ObjectFactory();
        beanFactory = new org.springframework.schema.beans.ObjectFactory();

        File seshdir = new File(files_dir);
        if (!seshdir.exists()) {
            if (!seshdir.mkdirs()) {
                log.error("Couldnt create jobs directory: " + seshdir.getAbsolutePath());
                throw new Exception("Couldnt create jobs directory: " + seshdir.getAbsolutePath());
            } else
                log.info("creating jobs directory: " + seshdir.getAbsolutePath());
        }

        instance = new JobFactory();
        return instance;
    }

    private static Job createJob(ObjectFactory factory, String id, String description) {

        Job job = factory.createJob();
        job.setId(id);
        job.setDescription(description);
        // the job can be restarted
        job.setRestartable("true");

        return job;
    }

    /**
     * Creates One-Step REST Service Job file the job and writes a xml file with
     * the same name as the jobIds
     * 
     * @param jobId
     * @param service
     * @param contenttype
     * @param method
     * @param body
     * @return
     * @throws JAXBException
     * @throws IOException
     */
    public static File createOneStepServiceJobFile(String jobId, String description,
            String service, String contenttype, String method, String body) throws JAXBException,
            IOException {

        log.debug(service);
        log.debug(body);
        String xml = createOneStepServiceJobXml(jobId, description, service, contenttype, method,
                body);
        Path file = Files.write(Paths.get(files_dir, jobId + ".xml"), xml.getBytes());

        log.debug(file.toAbsolutePath());
        return file.toFile();
    }

    /**
     * Creates One-Step REST Service Job XML string
     * 
     * @param jobId
     * @param service
     * @param contenttype
     * @param method
     * @param body
     * @return
     * @throws JAXBException
     * @throws IOException
     */
    public static String createOneStepServiceJobXml(String jobId, String description,
            String service, String contenttype, String method, String body) throws JAXBException,
            IOException {

        // creates the bean of the service with the corresponding parameters
        Bean beanService = BeanFactory.createServiceTaskletBean(beanFactory, "beanService",
                service, contenttype, method, body);
        /*
         * creates a new job of one step
         * 
         * <batch:job id="limesJobSampleJsonss" restartable="true"
         * incrementer="jobParamatersIncrementer"> <batch:step id="limesStep" >
         * <batch:tasklet ref="serviceTasklet" /> </batch:step> </batch:job>
         */

        TaskletType tasklet = batchFactory.createTaskletType();
        tasklet.setRef("beanService");

        org.springframework.schema.batch.Job.Step jobstep = batchFactory.createJobStep();
        jobstep.setId("oneStep");
        jobstep.setTasklet(tasklet);

        Bean jobIncrementer = beanFactory.createBean();
        jobIncrementer.setId("jobParamatersIncrementer");
        jobIncrementer.setClazz("org.springframework.batch.core.launch.support.RunIdIncrementer");

        Job job = JobFactory.createJob(batchFactory, jobId, description);
        log.debug(job.getDescription());
        job.getStepOrSplitOrFlow().add(jobstep);
        job.setIncrementer("jobParamatersIncrementer");

        // generates the root beans
        Beans beans = beanFactory.createBeans();
        beans.getImportOrAliasOrBean().add(job);
        beans.getImportOrAliasOrBean().add(beanService);
        beans.getImportOrAliasOrBean().add(jobIncrementer);

        // write the xml to a string

        StringWriter writer = new StringWriter();

        final String location = "http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd"
                + " http://www.springframework.org/schema/batch http://www.springframework.org/schema/batch/spring-batch.xsd"
                + " http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context.xsd";

        Class[] classes = new Class[] { Beans.class, Bean.class, Job.class };
        JAXBContext jaxbContext = JAXBContext.newInstance(classes);
        Marshaller jaxbMarshaller = jaxbContext.createMarshaller();
        jaxbMarshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, Boolean.TRUE);
        jaxbMarshaller.setProperty(Marshaller.JAXB_ENCODING, "UTF-8");
        jaxbMarshaller.setProperty(Marshaller.JAXB_SCHEMA_LOCATION, location);
        jaxbMarshaller.marshal(beans, writer);

        log.debug(writer.toString());
        // return the name of the job file generated
        return writer.toString();
    }

    /**
     * Creates a job based on the OneStepServiceJob bean. Notice that body
     * requires URLEncoded.
     * 
     * @param job
     * @return File
     * @throws JAXBException
     * @throws IOException
     */
    public static File createOneStepServiceJobFile(OneStepServiceJob job) throws JAXBException,
            IOException {
        log.debug(job.toString());

        File file = createOneStepServiceJobFile(job.getName(), job.getDescription(), job
                .getService(), job.getContenttype(), job.getMethod(), URLDecoder.decode(job
                .getBody(), "utf-8"));
        return file;
    }
}
