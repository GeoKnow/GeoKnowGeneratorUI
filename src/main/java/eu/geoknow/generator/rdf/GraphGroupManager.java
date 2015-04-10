package eu.geoknow.generator.rdf;

/**
 * Created by taleksaschina on 15.10.2014.
 */

/**
 * Manages RDF graph groups
 */
public interface GraphGroupManager {
    /**
     * Creates empty graph group.
     * @param group
     *          Graph group URI
     * @throws Exception
     */
    void createGraphGroup(String group) throws Exception;

    /**
     * Add graph to specified graph group. Both graph and group must exists.
     * @param group
     *          Existing graph group URI
     * @param graph
     *          Existing graph URI
     * @throws Exception
     */
    void addGraph(String group, String graph) throws Exception;

    /**
     * Remove graph from graph group. This method doesn't remove graph from RDF store.
     * @param group
     *          Graph group URI
     * @param graph
     *          Graph URI
     * @throws Exception
     */
    void removeGraph(String group, String graph) throws Exception;

    /**
     * Delete graph group from RDF store.
     * @param group
     *          Existing graph group URI
     * @throws Exception
     */
    void dropGroup(String group) throws Exception;
}
