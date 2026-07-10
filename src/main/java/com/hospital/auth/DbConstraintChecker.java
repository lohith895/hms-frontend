package com.hospital.auth;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class DbConstraintChecker implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public DbConstraintChecker(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("================ DB CONSTRAINTS ================");
        List<Map<String, Object>> res = jdbcTemplate.queryForList(
                "SELECT conname, conrelid::regclass AS table_name " +
                "FROM pg_constraint " +
                "WHERE conname = 'uk7tdcd6ab5wsgoudnvj7xf1b7l'"
        );
        for (Map<String, Object> row : res) {
            System.out.println(row);
        }
        System.out.println("================================================");
    }
}
