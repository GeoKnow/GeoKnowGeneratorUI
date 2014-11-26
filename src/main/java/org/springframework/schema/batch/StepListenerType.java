//
// This file was generated by the JavaTM Architecture for XML Binding(JAXB) Reference Implementation, v2.2.4-2 
// See <a href="http://java.sun.com/xml/jaxb">http://java.sun.com/xml/jaxb</a> 
// Any modifications to this file will be lost upon recompilation of the source schema. 
// Generated on: 2014.10.14 at 12:54:47 PM CEST 
//


package org.springframework.schema.batch;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlSeeAlso;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for stepListenerType complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="stepListenerType">
 *   &lt;complexContent>
 *     &lt;extension base="{http://www.springframework.org/schema/batch}listenerType">
 *       &lt;attribute name="before-step-method" type="{http://www.w3.org/2001/XMLSchema}string" />
 *       &lt;attribute name="after-step-method" type="{http://www.w3.org/2001/XMLSchema}string" />
 *       &lt;attribute name="before-chunk-method" type="{http://www.w3.org/2001/XMLSchema}string" />
 *       &lt;attribute name="after-chunk-method" type="{http://www.w3.org/2001/XMLSchema}string" />
 *       &lt;attribute name="after-chunk-error-method" type="{http://www.w3.org/2001/XMLSchema}string" />
 *       &lt;attribute name="before-read-method" type="{http://www.w3.org/2001/XMLSchema}string" />
 *       &lt;attribute name="after-read-method" type="{http://www.w3.org/2001/XMLSchema}string" />
 *       &lt;attribute name="on-read-error-method" type="{http://www.w3.org/2001/XMLSchema}string" />
 *       &lt;attribute name="before-process-method" type="{http://www.w3.org/2001/XMLSchema}string" />
 *       &lt;attribute name="after-process-method" type="{http://www.w3.org/2001/XMLSchema}string" />
 *       &lt;attribute name="on-process-error-method" type="{http://www.w3.org/2001/XMLSchema}string" />
 *       &lt;attribute name="before-write-method" type="{http://www.w3.org/2001/XMLSchema}string" />
 *       &lt;attribute name="after-write-method" type="{http://www.w3.org/2001/XMLSchema}string" />
 *       &lt;attribute name="on-write-error-method" type="{http://www.w3.org/2001/XMLSchema}string" />
 *       &lt;attribute name="on-skip-in-read-method" type="{http://www.w3.org/2001/XMLSchema}string" />
 *       &lt;attribute name="on-skip-in-process-method" type="{http://www.w3.org/2001/XMLSchema}string" />
 *       &lt;attribute name="on-skip-in-write-method" type="{http://www.w3.org/2001/XMLSchema}string" />
 *     &lt;/extension>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "stepListenerType")
@XmlSeeAlso({
    StepListener.class
})
public class StepListenerType
    extends ListenerType
{

    @XmlAttribute(name = "before-step-method")
    protected String beforeStepMethod;
    @XmlAttribute(name = "after-step-method")
    protected String afterStepMethod;
    @XmlAttribute(name = "before-chunk-method")
    protected String beforeChunkMethod;
    @XmlAttribute(name = "after-chunk-method")
    protected String afterChunkMethod;
    @XmlAttribute(name = "after-chunk-error-method")
    protected String afterChunkErrorMethod;
    @XmlAttribute(name = "before-read-method")
    protected String beforeReadMethod;
    @XmlAttribute(name = "after-read-method")
    protected String afterReadMethod;
    @XmlAttribute(name = "on-read-error-method")
    protected String onReadErrorMethod;
    @XmlAttribute(name = "before-process-method")
    protected String beforeProcessMethod;
    @XmlAttribute(name = "after-process-method")
    protected String afterProcessMethod;
    @XmlAttribute(name = "on-process-error-method")
    protected String onProcessErrorMethod;
    @XmlAttribute(name = "before-write-method")
    protected String beforeWriteMethod;
    @XmlAttribute(name = "after-write-method")
    protected String afterWriteMethod;
    @XmlAttribute(name = "on-write-error-method")
    protected String onWriteErrorMethod;
    @XmlAttribute(name = "on-skip-in-read-method")
    protected String onSkipInReadMethod;
    @XmlAttribute(name = "on-skip-in-process-method")
    protected String onSkipInProcessMethod;
    @XmlAttribute(name = "on-skip-in-write-method")
    protected String onSkipInWriteMethod;

    /**
     * Gets the value of the beforeStepMethod property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getBeforeStepMethod() {
        return beforeStepMethod;
    }

    /**
     * Sets the value of the beforeStepMethod property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setBeforeStepMethod(String value) {
        this.beforeStepMethod = value;
    }

    /**
     * Gets the value of the afterStepMethod property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getAfterStepMethod() {
        return afterStepMethod;
    }

    /**
     * Sets the value of the afterStepMethod property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setAfterStepMethod(String value) {
        this.afterStepMethod = value;
    }

    /**
     * Gets the value of the beforeChunkMethod property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getBeforeChunkMethod() {
        return beforeChunkMethod;
    }

    /**
     * Sets the value of the beforeChunkMethod property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setBeforeChunkMethod(String value) {
        this.beforeChunkMethod = value;
    }

    /**
     * Gets the value of the afterChunkMethod property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getAfterChunkMethod() {
        return afterChunkMethod;
    }

    /**
     * Sets the value of the afterChunkMethod property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setAfterChunkMethod(String value) {
        this.afterChunkMethod = value;
    }

    /**
     * Gets the value of the afterChunkErrorMethod property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getAfterChunkErrorMethod() {
        return afterChunkErrorMethod;
    }

    /**
     * Sets the value of the afterChunkErrorMethod property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setAfterChunkErrorMethod(String value) {
        this.afterChunkErrorMethod = value;
    }

    /**
     * Gets the value of the beforeReadMethod property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getBeforeReadMethod() {
        return beforeReadMethod;
    }

    /**
     * Sets the value of the beforeReadMethod property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setBeforeReadMethod(String value) {
        this.beforeReadMethod = value;
    }

    /**
     * Gets the value of the afterReadMethod property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getAfterReadMethod() {
        return afterReadMethod;
    }

    /**
     * Sets the value of the afterReadMethod property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setAfterReadMethod(String value) {
        this.afterReadMethod = value;
    }

    /**
     * Gets the value of the onReadErrorMethod property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getOnReadErrorMethod() {
        return onReadErrorMethod;
    }

    /**
     * Sets the value of the onReadErrorMethod property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setOnReadErrorMethod(String value) {
        this.onReadErrorMethod = value;
    }

    /**
     * Gets the value of the beforeProcessMethod property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getBeforeProcessMethod() {
        return beforeProcessMethod;
    }

    /**
     * Sets the value of the beforeProcessMethod property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setBeforeProcessMethod(String value) {
        this.beforeProcessMethod = value;
    }

    /**
     * Gets the value of the afterProcessMethod property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getAfterProcessMethod() {
        return afterProcessMethod;
    }

    /**
     * Sets the value of the afterProcessMethod property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setAfterProcessMethod(String value) {
        this.afterProcessMethod = value;
    }

    /**
     * Gets the value of the onProcessErrorMethod property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getOnProcessErrorMethod() {
        return onProcessErrorMethod;
    }

    /**
     * Sets the value of the onProcessErrorMethod property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setOnProcessErrorMethod(String value) {
        this.onProcessErrorMethod = value;
    }

    /**
     * Gets the value of the beforeWriteMethod property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getBeforeWriteMethod() {
        return beforeWriteMethod;
    }

    /**
     * Sets the value of the beforeWriteMethod property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setBeforeWriteMethod(String value) {
        this.beforeWriteMethod = value;
    }

    /**
     * Gets the value of the afterWriteMethod property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getAfterWriteMethod() {
        return afterWriteMethod;
    }

    /**
     * Sets the value of the afterWriteMethod property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setAfterWriteMethod(String value) {
        this.afterWriteMethod = value;
    }

    /**
     * Gets the value of the onWriteErrorMethod property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getOnWriteErrorMethod() {
        return onWriteErrorMethod;
    }

    /**
     * Sets the value of the onWriteErrorMethod property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setOnWriteErrorMethod(String value) {
        this.onWriteErrorMethod = value;
    }

    /**
     * Gets the value of the onSkipInReadMethod property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getOnSkipInReadMethod() {
        return onSkipInReadMethod;
    }

    /**
     * Sets the value of the onSkipInReadMethod property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setOnSkipInReadMethod(String value) {
        this.onSkipInReadMethod = value;
    }

    /**
     * Gets the value of the onSkipInProcessMethod property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getOnSkipInProcessMethod() {
        return onSkipInProcessMethod;
    }

    /**
     * Sets the value of the onSkipInProcessMethod property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setOnSkipInProcessMethod(String value) {
        this.onSkipInProcessMethod = value;
    }

    /**
     * Gets the value of the onSkipInWriteMethod property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getOnSkipInWriteMethod() {
        return onSkipInWriteMethod;
    }

    /**
     * Sets the value of the onSkipInWriteMethod property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setOnSkipInWriteMethod(String value) {
        this.onSkipInWriteMethod = value;
    }

}
