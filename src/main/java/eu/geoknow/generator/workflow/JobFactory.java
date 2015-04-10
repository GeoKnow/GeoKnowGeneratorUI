package eu.geoknow.generator.workflow;

import java.io.IOException;
import java.io.StringWriter;
import java.net.URLDecoder;
import java.util.TreeMap;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;

import org.apache.log4j.Logger;
import org.springframework.schema.batch.Job;
import org.springframework.schema.batch.ObjectFactory;
import org.springframework.schema.batch.TaskletType;
import org.springframework.schema.beans.Bean;
import org.springframework.schema.beans.Beans;

import eu.geoknow.generator.workflow.beans.MultiStepJob;
import eu.geoknow.generator.workflow.beans.OneStepServiceJob;
import eu.geoknow.generator.workflow.beans.Step;

/**
 * This class is used to create spring batch jobs definitions. This class is to
 * be extended to be able to generate workflows of several steps.
 * 
 * @author alejandragarciarojas
 *
 */
public class JobFactory {

    private static final Logger log = Logger.getLogger(JobFactory.class);

    private org.springframework.schema.batch.ObjectFactory batchFactory;
    private org.springframework.schema.beans.ObjectFactory beanFactory;

    private static JobFactory instance;

    /**
     * Get the singleton instance of the job factory
     * @return
     * @throws Exception
     */
    public static synchronized JobFactory getInstance() throws Exception {

        if (instance != null)
            return instance;
        instance = new JobFactory();

        instance.batchFactory = new org.springframework.schema.batch.ObjectFactory();
        instance.beanFactory = new org.springframework.schema.beans.ObjectFactory();
        return instance;
    }

    private Job createJob(ObjectFactory factory, String id, String description) {

        Job job = factory.createJob();
        job.setId(id);
        job.setDescription(description);
        // the job can be restarted
        job.setRestartable("true");

        return job;
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
    public String createOneStepServiceJobXml(String jobId, String description,
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

        Job job = createJob(batchFactory, jobId, description);
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
     * @return String a XML string
     * @throws Exception 
     */
    public String createOneStepServiceJobXml(OneStepServiceJob job) throws Exception {
        log.debug(job.toString());

        String xml = createOneStepServiceJobXml(job.getName(), "", job
                .getService(), job.getContenttype(), job.getMethod(), URLDecoder.decode(job
                .getBody(), "utf-8"));
        return xml;
    }
    
    /**
     * Creates Mulit-Step REST Service Job XML string
     * 
     * @param msj the multistep object received from the REST API
     * @return
     * @throws Exception 
     */
    public String createMultiStepServiceJobXml(MultiStepJob msj) throws Exception {
    	//if no step, no job is created
    	if(msj.getSteps().size() == 0) throw new Exception("No steps, thus, no job.");
    	//create job bean
        Bean jobIncrementer = beanFactory.createBean();
        jobIncrementer.setId("jobParamatersIncrementer");
        jobIncrementer.setClazz("org.springframework.batch.core.launch.support.RunIdIncrementer");
        Job job = createJob(batchFactory, msj.getName(), "");
        
        job.setIncrementer("jobParamatersIncrementer");
        // generates the root beans
        Beans rootBean = beanFactory.createBeans();
        rootBean.getImportOrAliasOrBean().add(job);
        rootBean.getImportOrAliasOrBean().add(jobIncrementer);
    	
    	//iterate through the steps, create the beans and store their order
    	TreeMap<Integer,Bean> stepBeans = new TreeMap<Integer, Bean>();
    	for(Step s : msj.getSteps()){
    		 Bean beanService = BeanFactory.createServiceTaskletBean(beanFactory, "beanService_"+msj.getName()+"_"+s.getNumberOfOrder(),
    				 s.getService(), s.getContenttype(), s.getMethod(), URLDecoder.decode(s.getBody(), "utf-8"));
    		 stepBeans.put(s.getNumberOfOrder(),beanService);
    		 //add the service bean to the root
    	     rootBean.getImportOrAliasOrBean().add(beanService);
    	}
    	//with the ordered list of the bean, create the tasklets and job steps, add them to the job
    	for(int i : stepBeans.keySet()){
    		TaskletType tasklet = batchFactory.createTaskletType();
            tasklet.setRef("beanService_"+msj.getName()+"_"+i);
            org.springframework.schema.batch.Job.Step jobstep = batchFactory.createJobStep();
            jobstep.setId("multiStep_"+msj.getName()+"_"+i);
            jobstep.setTasklet(tasklet);
            //if there is a next step, add it as reference
            //this creates a simple sequential flow
            if((i+1) <= stepBeans.size()){
            	jobstep.setNext("multiStep_"+msj.getName()+"_"+(i+1));
            }
            job.getStepOrSplitOrFlow().add(jobstep);
    	}
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
        jaxbMarshaller.marshal(rootBean, writer);

        log.info(writer.toString());
        // return the name of the job file generated
        return writer.toString();
    }
    
}
