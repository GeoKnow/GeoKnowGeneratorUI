package workflow;

import javax.xml.bind.JAXBElement;
import javax.xml.namespace.QName;

import org.springframework.schema.beans.Bean;
import org.springframework.schema.beans.ObjectFactory;
import org.springframework.schema.beans.PropertyType;
import org.springframework.schema.beans.Value;

/**
 * This class is used to create spring batch beans of REST services using
 * org.geoknow.batch.ServiceTasklet defined in the batch admin service.
 * 
 * It will retuns beans objects required to form the following xml bean:
 * 
 * <bean id="serviceTasklet" class="org.geoknow.batch.ServiceTasklet"> <property
 * name="service" value="http://localhost:8080/limes-service/" /> <property
 * name="contenttype" value="application/json" /> <property name="method"
 * value="POST" /> <property name="body"> <value> <![CDATA[]]> </value>
 * </property> </bean>
 * 
 * @author alejandragarciarojas
 *
 */
public class BeanFactory {

    /**
     * Creates the bean. It requires the bean ObjectFactory to generate the bean
     * instances.
     * 
     * @param factory
     *            bean ObjectFactory
     * @param id
     * @param service
     *            url of the Rest service
     * @param contenttype
     *            for the request object
     * @param method
     *            used on the request object
     * @param body
     *            content
     * @return
     */
    public static Bean createServiceTaskletBean(ObjectFactory factory, String id, String service,
            String contenttype, String method, String body) {

        Bean bean = factory.createBean();
        bean.setId(id);
        bean.setClazz("eu.geoknow.batch.ServiceTasklet");
        QName.valueOf("property");

        PropertyType pservice = factory.createPropertyType();
        pservice.setName("service");
        pservice.setValue(service);
        JAXBElement<PropertyType> bservice = factory.createProperty(pservice);

        PropertyType pcontenttype = factory.createPropertyType();
        pcontenttype.setName("contenttype");
        pcontenttype.setValue(contenttype);
        JAXBElement<PropertyType> bcontenttype = factory.createProperty(pcontenttype);

        PropertyType pmethod = factory.createPropertyType();
        pmethod.setName("method");
        pmethod.setValue(method);
        JAXBElement<PropertyType> bmethod = factory.createProperty(pmethod);

        Value vbody = factory.createValue();
        vbody.getContent().add(body);
        PropertyType pbody = factory.createPropertyType();
        pbody.setName("body");
        pbody.setValueAttribute(vbody);
        JAXBElement<PropertyType> bbody = factory.createProperty(pbody);

        bean.getMetaOrConstructorArgOrProperty().add(bservice);
        bean.getMetaOrConstructorArgOrProperty().add(bcontenttype);
        bean.getMetaOrConstructorArgOrProperty().add(bmethod);
        bean.getMetaOrConstructorArgOrProperty().add(bbody);

        return bean;
    }
}
