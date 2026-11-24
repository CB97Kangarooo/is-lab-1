package ru.itmo.is.lab.repository;

import ru.itmo.is.lab.entity.AppUser;

import javax.enterprise.context.ApplicationScoped;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.util.List;

@ApplicationScoped
public class UserRepository {

    @PersistenceContext
    private EntityManager em;

    public AppUser findByUsername(String username) {
        List<AppUser> found = em.createQuery(
                        "select u from AppUser u where u.username = :username", AppUser.class)
                .setParameter("username", username)
                .getResultList();
        return found.isEmpty() ? null : found.get(0);
    }

    public void persist(AppUser user) {
        em.persist(user);
    }
}
