package workflow;

import static org.junit.Assert.assertTrue;

import java.io.ByteArrayOutputStream;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;

import org.junit.Test;
import org.springframework.schema.beans.Bean;
import org.springframework.schema.beans.Beans;
import org.springframework.schema.beans.ObjectFactory;

import workflow.BeanFactory;

public class BeanFactoryTest {

    @Test
    public void createBeanTest() throws JAXBException {

        ObjectFactory factory = new ObjectFactory();

        Bean bean = BeanFactory.createServiceTaskletBean(factory, "beanService",
                "http://aservice.com/", "application/json", "post", "the content");

        Beans beans = factory.createBeans();
        beans.getImportOrAliasOrBean().add(bean);

        JAXBContext jaxbContext = JAXBContext.newInstance(Beans.class);
        Marshaller jaxbMarshaller = jaxbContext.createMarshaller();

        ByteArrayOutputStream os = new ByteArrayOutputStream();
        jaxbMarshaller.marshal(beans, os);
        String res = new String(os.toByteArray());
        assertTrue(res
                .contains("<beans xmlns=\"http://www.springframework.org/schema/beans\"><bean class=\"org.geoknow.batch.ServiceTasklet\""));
    }
}
