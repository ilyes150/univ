package com.unidz.portal.repository;

import com.unidz.portal.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Integer> {}
public interface LoginRepository extends JpaRepository<Login, Integer> {
    Optional<Login> findByUsername(String username);
}
public interface ResultRepository extends JpaRepository<Result, Integer> {}
public interface Semester1Repository extends JpaRepository<Semester1, Integer> {}
public interface Semester2Repository extends JpaRepository<Semester2, Integer> {}
public interface Semester3Repository extends JpaRepository<Semester3, Integer> {}