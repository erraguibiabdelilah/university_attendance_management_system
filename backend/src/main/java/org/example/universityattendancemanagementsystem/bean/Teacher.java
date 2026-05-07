package org.example.universityattendancemanagementsystem.bean;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@DiscriminatorValue("TEACHER")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Teacher extends User {

    private String departement;
    private String grade;
}
