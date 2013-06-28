package org.linkeddata;

import java.net.*;
import java.net.URI;
import java.io.*;

import com.vaadin.event.FieldEvents.TextChangeEvent;
import com.vaadin.event.FieldEvents.TextChangeListener;
//import com.vaadin.terminal.ExternalResource;
import com.vaadin.ui.*;
import com.vaadin.ui.Label;
import com.vaadin.ui.Alignment.*;
import com.vaadin.ui.AbstractSelect.Filtering;
import com.vaadin.ui.Button.ClickEvent;
import com.vaadin.ui.Button.ClickListener;
import com.vaadin.ui.Field.ValueChangeEvent;
import com.vaadin.ui.Window;
import com.vaadin.ui.Layout.*;
import com.vaadin.data.Property;
import com.vaadin.data.Property.*;

import org.openrdf.model.*;
import org.openrdf.model.Value;
import org.openrdf.query.BindingSet;
import org.openrdf.query.MalformedQueryException;
import org.openrdf.query.QueryEvaluationException;
import org.openrdf.query.QueryLanguage;
import org.openrdf.query.TupleQuery;
import org.openrdf.query.TupleQueryResult;
import org.openrdf.query.parser.ParsedQuery;
import org.openrdf.query.parser.sparql.SPARQLParser;
import org.openrdf.repository.Repository;
import org.openrdf.repository.RepositoryConnection;
import org.openrdf.repository.RepositoryException;
import org.openrdf.model.impl.*;


import org.restlet.resource.ClientResource;
import org.restlet.data.MediaType;

import virtuoso.sesame2.driver.VirtuosoRepository;
import org.linkeddata.GeoKnowDemoState;

/**
 * Export Selector.
 * A common way to select and set the output graph
 */
//@SuppressWarnings("serial")
public class ExportSelector extends CustomComponent
implements AbstractSelect.NewItemHandler,
           Property.ValueChangeListener 
{

    // reference to the global internal state
    private GeoKnowDemoState state;

    // fields
    private ComboBox graphSelector;
    private Boolean updateCurrentGraph = false;

    public ExportSelector(GeoKnowDemoState st) {
            this(st, false);
    };

    public ExportSelector(GeoKnowDemoState st, Boolean update) {

        // The internal state 
        state = st;
        updateCurrentGraph = update;


        VerticalLayout layout = new VerticalLayout();

        // the graph selector
        // it displays all acceptable graphs in Virtuoso 
        // XXX TODO show only those which are editable in OntoWiki
        graphSelector = new ComboBox("Select Export graph: ");
        graphSelector.setDebugId(this.getClass().getSimpleName()+"_graphSelector");
        graphSelector.setNewItemsAllowed(true);
        graphSelector.setImmediate(true);
        graphSelector.addListener(this);
        graphSelector.setNewItemHandler(this);
        graphSelector.setFilteringMode(Filtering.FILTERINGMODE_CONTAINS);
        addCandidateGraphs(graphSelector);
        layout.addComponent(graphSelector);

        // The composition root MUST be set
        setCompositionRoot(layout);
    }

    // propagate the information of one tab to another.
    public void setDefaults() {
    };


    public void addCandidateGraphs(AbstractSelect selection) {
        // add current graph as default possibility
        // only if the current graph has been set

        if (state.getCurrentGraph() != null && state.getCurrentGraph() != "") {
            selection.addItem("current graph");
            selection.select("current graph");
        };

        try {
            RepositoryConnection con = state.getRdfStore().getConnection();

            // initialize the hostname and portnumber
            String query = "SELECT  DISTINCT ?g { GRAPH ?g { ?s  ?p  ?o }. OPTIONAL {?g <http://lod2.eu/lod2demo/SystemGraphFor> ?sys.}. FILTER (!bound(?sys))} limit 100";
            TupleQuery tupleQuery = con.prepareTupleQuery(QueryLanguage.SPARQL, query);
            TupleQueryResult result = tupleQuery.evaluate();


            while (result.hasNext()) {
                BindingSet bindingSet = result.next();
                Value valueOfG = bindingSet.getValue("g");
                // exclude some value to be candidates
                if (valueOfG.stringValue() != "null") {
                    selection.addItem(valueOfG.stringValue());
                };
            };


        } catch (RepositoryException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        } catch (MalformedQueryException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        } catch (QueryEvaluationException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    };

    public void addNewItem(String newItemCaption) {
        final String newItem = newItemCaption;

        // request the user whether to add it to the list or to reject his choice.
        final Window subwindow = new Window("Create new graph");
        subwindow.setModal(true);

        // Configure the windows layout; by default a VerticalLayout
        VerticalLayout swlayout = (VerticalLayout) subwindow.getContent();

        Label desc = new Label("The graphname " + newItemCaption + " is not a known graph. Shall we create the graph?");
        HorizontalLayout buttons = new HorizontalLayout();

        Button ok = new Button("Create graph",new ClickListener() {
                public void buttonClick(ClickEvent event) {
                createGraph(newItem);
                //(subwindow.getParent()).removeWindow(subwindow);
                }
                });
        ok.setDebugId(this.getClass().getSimpleName()+"_ok");
        Button cancel = new Button("Cancel", new ClickListener() {
                public void buttonClick(ClickEvent event) {
                //(subwindow.getParent()).removeWindow(subwindow);
                }
                });
        cancel.setDebugId(this.getClass().getSimpleName()+"_cancel");
        
        swlayout.addComponent(desc);
        swlayout.addComponent(buttons);
        buttons.addComponent(ok);
        buttons.addComponent(cancel);
        buttons.setComponentAlignment(ok, Alignment.BOTTOM_RIGHT);
        buttons.setComponentAlignment(cancel, Alignment.BOTTOM_RIGHT);
        //getWindow().addWindow(subwindow);
        subwindow.setWidth("300px");

    }


    private void createGraph(String newGraph) {
        graphSelector.addItem(newGraph);
        graphSelector.select(newGraph);
        activateGraph(newGraph);

    };


    private void activateGraph(String newGraph) {

        try {
            RepositoryConnection con = state.getRdfStore().getConnection();

            // initialize the hostname and portnumber
            String query = "create silent graph <" + newGraph + ">"; 
            TupleQuery tupleQuery = con.prepareTupleQuery(QueryLanguage.SPARQL, query);
            TupleQueryResult result = tupleQuery.evaluate();

        } catch (RepositoryException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        } catch (MalformedQueryException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        } catch (QueryEvaluationException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }

    };

    // return the graph name for the export
    public String getExportGraph() {

        if (graphSelector.getValue() != null) {
            String val = (String) graphSelector.getValue();
            String g;
            if (graphSelector.getValue().equals("current graph")) {
                g = state.getCurrentGraph();
            } else {
                g = val;
            };
            return g;
        } else {
            return null;
        }
    };

    /* Respond to change in the selection. */
    public void valueChange(Property.ValueChangeEvent event) {
        if (state.getCurrentGraph() != null && state.getCurrentGraph().equals("")) {
               state.setCurrentGraph(event.getProperty().toString());
        } else if (updateCurrentGraph) {
               state.setCurrentGraph(event.getProperty().toString());
        };
    };

};

