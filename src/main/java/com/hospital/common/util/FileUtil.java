package com.hospital.common.util;

import org.springframework.util.StringUtils;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public class FileUtil {
    public static void saveFile(String uploadDir, String fileName, byte[] content) throws IOException {
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        Path filePath = uploadPath.resolve(StringUtils.cleanPath(fileName));
        Files.write(filePath, content);
    }
}
