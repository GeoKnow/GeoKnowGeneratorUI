package accounts;

import java.util.ArrayList;
import java.util.Collection;

public class UserProfileExtended {
    private UserProfile profile;
    private Collection<String> ownGraphs = new ArrayList<String>();
    private Collection<String> readableGraphs = new ArrayList<String>();
    private Collection<String> writableGraphs = new ArrayList<String>();

    public UserProfile getProfile() {
        return profile;
    }

    public void setProfile(UserProfile profile) {
        this.profile = profile;
    }

    public Collection<String> getOwnGraphs() {
        return ownGraphs;
    }

    public void setOwnGraphs(Collection<String> ownGraphs) {
        this.ownGraphs = ownGraphs;
    }

    public Collection<String> getReadableGraphs() {
        return readableGraphs;
    }

    public void setReadableGraphs(Collection<String> readableGraphs) {
        this.readableGraphs = readableGraphs;
    }

    public Collection<String> getWritableGraphs() {
        return writableGraphs;
    }

    public void setWritableGraphs(Collection<String> writableGraphs) {
        this.writableGraphs = writableGraphs;
    }
}
