//
// This file was generated by the JavaTM Architecture for XML Binding(JAXB) Reference Implementation, v2.2.4-2 
// See <a href="http://java.sun.com/xml/jaxb">http://java.sun.com/xml/jaxb</a> 
// Any modifications to this file will be lost upon recompilation of the source schema. 
// Generated on: 2014.10.14 at 12:54:47 PM CEST 
//


package org.springframework.schema.batch;

import javax.xml.bind.annotation.XmlRegistry;


/**
 * This object contains factory methods for each 
 * Java content interface and Java element interface 
 * generated in the org.springframework.schema.batch package. 
 * <p>An ObjectFactory allows you to programatically 
 * construct new instances of the Java representation 
 * for XML content. The Java representation of XML 
 * content can consist of schema derived interfaces 
 * and classes representing the binding of schema 
 * type definitions, element declarations and model 
 * groups.  Factory methods for each of these are 
 * provided in this class.
 * 
 */
@XmlRegistry
public class ObjectFactory {


    /**
     * Create a new ObjectFactory that can be used to create new instances of schema derived classes for package: org.springframework.schema.batch
     * 
     */
    public ObjectFactory() {
    }

    /**
     * Create an instance of {@link org.springframework.schema.batch.Job }
     * 
     */
    public org.springframework.schema.batch.Job createJob() {
        return new org.springframework.schema.batch.Job();
    }

    /**
     * Create an instance of {@link StepType }
     * 
     */
    public StepType createStepType() {
        return new StepType();
    }

    /**
     * Create an instance of {@link ChunkTaskletType }
     * 
     */
    public ChunkTaskletType createChunkTaskletType() {
        return new ChunkTaskletType();
    }

    /**
     * Create an instance of {@link ChunkTaskletType.RetryableExceptionClasses }
     * 
     */
    public ChunkTaskletType.RetryableExceptionClasses createChunkTaskletTypeRetryableExceptionClasses() {
        return new ChunkTaskletType.RetryableExceptionClasses();
    }

    /**
     * Create an instance of {@link ChunkTaskletType.Streams }
     * 
     */
    public ChunkTaskletType.Streams createChunkTaskletTypeStreams() {
        return new ChunkTaskletType.Streams();
    }

    /**
     * Create an instance of {@link PartitionType }
     * 
     */
    public PartitionType createPartitionType() {
        return new PartitionType();
    }

    /**
     * Create an instance of {@link TaskletType }
     * 
     */
    public TaskletType createTaskletType() {
        return new TaskletType();
    }

    /**
     * Create an instance of {@link org.springframework.schema.batch.Job.Split }
     * 
     */
    public org.springframework.schema.batch.Job.Split createJobSplit() {
        return new org.springframework.schema.batch.Job.Split();
    }

    /**
     * Create an instance of {@link JobRepository }
     * 
     */
    public JobRepository createJobRepository() {
        return new JobRepository();
    }

    /**
     * Create an instance of {@link StepListener }
     * 
     */
    public StepListener createStepListener() {
        return new StepListener();
    }

    /**
     * Create an instance of {@link StepListenerType }
     * 
     */
    public StepListenerType createStepListenerType() {
        return new StepListenerType();
    }

    /**
     * Create an instance of {@link ListenerType }
     * 
     */
    public ListenerType createListenerType() {
        return new ListenerType();
    }

    /**
     * Create an instance of {@link org.springframework.schema.batch.Job.Step }
     * 
     */
    public org.springframework.schema.batch.Job.Step createJobStep() {
        return new org.springframework.schema.batch.Job.Step();
    }

    /**
     * Create an instance of {@link org.springframework.schema.batch.Job.Flow }
     * 
     */
    public org.springframework.schema.batch.Job.Flow createJobFlow() {
        return new org.springframework.schema.batch.Job.Flow();
    }

    /**
     * Create an instance of {@link org.springframework.schema.batch.Job.Decision }
     * 
     */
    public org.springframework.schema.batch.Job.Decision createJobDecision() {
        return new org.springframework.schema.batch.Job.Decision();
    }

    /**
     * Create an instance of {@link org.springframework.schema.batch.Job.Listeners }
     * 
     */
    public org.springframework.schema.batch.Job.Listeners createJobListeners() {
        return new org.springframework.schema.batch.Job.Listeners();
    }

    /**
     * Create an instance of {@link org.springframework.schema.batch.Job.Validator }
     * 
     */
    public org.springframework.schema.batch.Job.Validator createJobValidator() {
        return new org.springframework.schema.batch.Job.Validator();
    }

    /**
     * Create an instance of {@link org.springframework.schema.batch.Flow }
     * 
     */
    public org.springframework.schema.batch.Flow createFlow() {
        return new org.springframework.schema.batch.Flow();
    }

    /**
     * Create an instance of {@link JobListener }
     * 
     */
    public JobListener createJobListener() {
        return new JobListener();
    }

    /**
     * Create an instance of {@link JobExecutionListenerType }
     * 
     */
    public JobExecutionListenerType createJobExecutionListenerType() {
        return new JobExecutionListenerType();
    }

    /**
     * Create an instance of {@link org.springframework.schema.batch.Step }
     * 
     */
    public org.springframework.schema.batch.Step createStep() {
        return new org.springframework.schema.batch.Step();
    }

    /**
     * Create an instance of {@link StepType.Job }
     * 
     */
    public StepType.Job createStepTypeJob() {
        return new StepType.Job();
    }

    /**
     * Create an instance of {@link StepType.Flow }
     * 
     */
    public StepType.Flow createStepTypeFlow() {
        return new StepType.Flow();
    }

    /**
     * Create an instance of {@link StepType.Next }
     * 
     */
    public StepType.Next createStepTypeNext() {
        return new StepType.Next();
    }

    /**
     * Create an instance of {@link StepType.Stop }
     * 
     */
    public StepType.Stop createStepTypeStop() {
        return new StepType.Stop();
    }

    /**
     * Create an instance of {@link StepType.End }
     * 
     */
    public StepType.End createStepTypeEnd() {
        return new StepType.End();
    }

    /**
     * Create an instance of {@link StepType.Fail }
     * 
     */
    public StepType.Fail createStepTypeFail() {
        return new StepType.Fail();
    }

    /**
     * Create an instance of {@link StepListenersType }
     * 
     */
    public StepListenersType createStepListenersType() {
        return new StepListenersType();
    }

    /**
     * Create an instance of {@link TransactionAttributesType }
     * 
     */
    public TransactionAttributesType createTransactionAttributesType() {
        return new TransactionAttributesType();
    }

    /**
     * Create an instance of {@link ChunkTaskletType.Reader }
     * 
     */
    public ChunkTaskletType.Reader createChunkTaskletTypeReader() {
        return new ChunkTaskletType.Reader();
    }

    /**
     * Create an instance of {@link ChunkTaskletType.Processor }
     * 
     */
    public ChunkTaskletType.Processor createChunkTaskletTypeProcessor() {
        return new ChunkTaskletType.Processor();
    }

    /**
     * Create an instance of {@link ChunkTaskletType.Writer }
     * 
     */
    public ChunkTaskletType.Writer createChunkTaskletTypeWriter() {
        return new ChunkTaskletType.Writer();
    }

    /**
     * Create an instance of {@link ChunkTaskletType.SkipPolicy }
     * 
     */
    public ChunkTaskletType.SkipPolicy createChunkTaskletTypeSkipPolicy() {
        return new ChunkTaskletType.SkipPolicy();
    }

    /**
     * Create an instance of {@link ChunkTaskletType.RetryPolicy }
     * 
     */
    public ChunkTaskletType.RetryPolicy createChunkTaskletTypeRetryPolicy() {
        return new ChunkTaskletType.RetryPolicy();
    }

    /**
     * Create an instance of {@link ChunkTaskletType.RetryListeners }
     * 
     */
    public ChunkTaskletType.RetryListeners createChunkTaskletTypeRetryListeners() {
        return new ChunkTaskletType.RetryListeners();
    }

    /**
     * Create an instance of {@link ChunkTaskletType.SkippableExceptionClasses }
     * 
     */
    public ChunkTaskletType.SkippableExceptionClasses createChunkTaskletTypeSkippableExceptionClasses() {
        return new ChunkTaskletType.SkippableExceptionClasses();
    }

    /**
     * Create an instance of {@link ChunkTaskletType.RetryableExceptionClasses.Include }
     * 
     */
    public ChunkTaskletType.RetryableExceptionClasses.Include createChunkTaskletTypeRetryableExceptionClassesInclude() {
        return new ChunkTaskletType.RetryableExceptionClasses.Include();
    }

    /**
     * Create an instance of {@link ChunkTaskletType.RetryableExceptionClasses.Exclude }
     * 
     */
    public ChunkTaskletType.RetryableExceptionClasses.Exclude createChunkTaskletTypeRetryableExceptionClassesExclude() {
        return new ChunkTaskletType.RetryableExceptionClasses.Exclude();
    }

    /**
     * Create an instance of {@link ChunkTaskletType.Streams.Stream }
     * 
     */
    public ChunkTaskletType.Streams.Stream createChunkTaskletTypeStreamsStream() {
        return new ChunkTaskletType.Streams.Stream();
    }

    /**
     * Create an instance of {@link PartitionType.Handler }
     * 
     */
    public PartitionType.Handler createPartitionTypeHandler() {
        return new PartitionType.Handler();
    }

    /**
     * Create an instance of {@link TaskletType.NoRollbackExceptionClasses }
     * 
     */
    public TaskletType.NoRollbackExceptionClasses createTaskletTypeNoRollbackExceptionClasses() {
        return new TaskletType.NoRollbackExceptionClasses();
    }

    /**
     * Create an instance of {@link org.springframework.schema.batch.Job.Split.Flow }
     * 
     */
    public org.springframework.schema.batch.Job.Split.Flow createJobSplitFlow() {
        return new org.springframework.schema.batch.Job.Split.Flow();
    }

}
