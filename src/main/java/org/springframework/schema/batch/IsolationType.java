//
// This file was generated by the JavaTM Architecture for XML Binding(JAXB) Reference Implementation, v2.2.4-2 
// See <a href="http://java.sun.com/xml/jaxb">http://java.sun.com/xml/jaxb</a> 
// Any modifications to this file will be lost upon recompilation of the source schema. 
// Generated on: 2014.10.14 at 12:54:47 PM CEST 
//


package org.springframework.schema.batch;

import javax.xml.bind.annotation.XmlEnum;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for isolationType.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * <p>
 * <pre>
 * &lt;simpleType name="isolationType">
 *   &lt;restriction base="{http://www.w3.org/2001/XMLSchema}string">
 *     &lt;enumeration value="DEFAULT"/>
 *     &lt;enumeration value="READ_UNCOMMITTED"/>
 *     &lt;enumeration value="READ_COMMITTED"/>
 *     &lt;enumeration value="REPEATABLE_READ"/>
 *     &lt;enumeration value="SERIALIZABLE"/>
 *   &lt;/restriction>
 * &lt;/simpleType>
 * </pre>
 * 
 */
@XmlType(name = "isolationType")
@XmlEnum
public enum IsolationType {

    DEFAULT,
    READ_UNCOMMITTED,
    READ_COMMITTED,
    REPEATABLE_READ,
    SERIALIZABLE;

    public String value() {
        return name();
    }

    public static IsolationType fromValue(String v) {
        return valueOf(v);
    }

}