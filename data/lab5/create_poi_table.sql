drop table if exists pois cascade;
drop function if exists update__pois__updated_on;

create table pois
(
    gid serial4 not null,
    last_changed timestamp default CURRENT_TIMESTAMP not null,
    poi_name varchar not null,
    reported_by varchar not null,
    geom geometry(point, 4326) not null,
    CONSTRAINT pois_pkey PRIMARY KEY (gid)
);


CREATE OR REPLACE FUNCTION update_last_changed_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.last_changed = now(); 
   RETURN NEW;
END;
$$ language 'plpgsql';


CREATE TRIGGER update_pois_last_changed
    BEFORE INSERT OR UPDATE
    ON pois FOR EACH ROW EXECUTE PROCEDURE 
    update_last_changed_column();

insert into pois (poi_name, reported_by, geom) values ('Best place ever!', 'By me', ST_GeomFromText('POINT(4.371631 52.006500)', 4326));
insert into pois (poi_name, reported_by, geom) values ('To hang out with nice weather', 'Also by me', ST_GeomFromText('POINT(4.362550 52.011432)', 4326));
insert into pois (poi_name, reported_by, geom) values ('I scream for ice cream', 'Me again', ST_GeomFromText('POINT(4.37057 52.00989)', 4326));

-- select * from pois;

