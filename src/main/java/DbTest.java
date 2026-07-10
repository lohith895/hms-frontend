
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class DbTest {
    public static void main(String[] args) {
        try {
            Class.forName("org.postgresql.Driver");
            Connection conn = DriverManager.getConnection("jdbc:postgresql://localhost:5432/hms_db", "postgres", "postgres");
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT conrelid::regclass AS table_name, conname, pg_get_constraintdef(c.oid) " +
                    "FROM pg_constraint c " +
                    "WHERE conname = 'uk7tdcd6ab5wsgoudnvj7xf1b7l'");
            while (rs.next()) {
                System.out.println("Table: " + rs.getString(1) + ", Constraint: " + rs.getString(2) + ", Def: " + rs.getString(3));
            }
            conn.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
