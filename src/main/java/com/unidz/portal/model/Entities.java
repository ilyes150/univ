package com.unidz.portal.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Entity
@Table(name = "student")
@Getter @Setter
public class Student {
    @Id
    private Integer id;
    private String fname;
    private String lname;
    @Column(name = "student_code")
    private String studentCode;
    private String field;
    private String major;
    private String specialty;
    private String cycle;
    private Integer level;
    @Column(name = "\"group\"")
    private Integer groupNum;
}

@Entity
@Table(name = "login")
@Getter @Setter
public class Login {
    @Id
    private Integer id;
    private String username;
    private String password;
}

@Entity
@Table(name = "result")
@Getter @Setter
public class Result {
    @Id
    private Integer id;
    @Column(name = "avg_s1") private BigDecimal avgS1;
    @Column(name = "avg_s2") private BigDecimal avgS2;
    @Column(name = "avg_s3") private BigDecimal avgS3;
    @Column(name = "avg_s4") private BigDecimal avgS4;
    private BigDecimal avg;
    private Integer rank;
}

@Entity
@Table(name = "semester1")
@Getter @Setter
public class Semester1 {
    @Id private Integer id;
    private BigDecimal asd1;
    private BigDecimal ios1;
    private BigDecimal sm;
    @Column(name = "avg_uef1") private BigDecimal avgUef1;
    @Column(name = "credit_uef1") private Integer creditUef1;
    private BigDecimal algebra1;
    private BigDecimal calculus1;
    @Column(name = "avg_uef2") private BigDecimal avgUef2;
    @Column(name = "credit_uef2") private Integer creditUef2;
    private BigDecimal electronic;
    @Column(name = "avg_ued") private BigDecimal avgUed;
    @Column(name = "credit_ued") private Integer creditUed;
    private BigDecimal te;
    @Column(name = "avg_uet") private BigDecimal avgUet;
    @Column(name = "credit_uet") private Integer creditUet;
    @Column(name = "credit_sem") private Integer creditSem;
    @Column(name = "avg_sem") private BigDecimal avgSem;
    private Integer rank;
}

@Entity
@Table(name = "semester2")
@Getter @Setter
public class Semester2 {
    @Id private Integer id;
    private BigDecimal asd2;
    private BigDecimal ado;
    @Column(name = "avg_uef1") private BigDecimal avgUef1;
    @Column(name = "credit_uef1") private Integer creditUef1;
    private BigDecimal algebra2;
    private BigDecimal calculus2;
    private BigDecimal lm;
    @Column(name = "avg_uef2") private BigDecimal avgUef2;
    @Column(name = "credit_uef2") private Integer creditUef2;
    private BigDecimal pst1;
    @Column(name = "avg_uem") private BigDecimal avgUem;
    @Column(name = "credit_uem") private Integer creditUem;
    private BigDecimal oet;
    @Column(name = "avg_uet") private BigDecimal avgUet;
    @Column(name = "credit_uet") private Integer creditUet;
    @Column(name = "credit_sem") private Integer creditSem;
    @Column(name = "avg_sem") private BigDecimal avgSem;
    private Integer rank;
}

@Entity
@Table(name = "semester3")
@Getter @Setter
public class Semester3 {
    @Id private Integer id;
    private BigDecimal asd3;
    private BigDecimal isi;
    private BigDecimal oop1;
    @Column(name = "avg_uef1") private BigDecimal avgUef1;
    @Column(name = "credit_uef1") private Integer creditUef1;
    private BigDecimal algebre3;
    private BigDecimal calculus3;
    @Column(name = "avg_uef2") private BigDecimal avgUef2;
    @Column(name = "credit_uef2") private Integer creditUef2;
    private BigDecimal pst2;
    @Column(name = "avg_uem") private BigDecimal avgUem;
    @Column(name = "credit_uem") private Integer creditUem;
    private BigDecimal entreprenariat;
    @Column(name = "avg_uet") private BigDecimal avgUet;
    @Column(name = "credit_uet") private Integer creditUet;
    @Column(name = "credit_sem") private Integer creditSem;
    @Column(name = "avg_sem") private BigDecimal avgSem;
    private Integer rank;
}