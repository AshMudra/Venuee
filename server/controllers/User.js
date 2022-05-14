const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../database/models/User");
const SECRET_KEY = process.env.SECRET_KEY;

// USER REGISTER
exports.registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email: email } });
    if (user) {
      return res
        .status(409)
        .send({ error: "409", message: "User already exists" });
    }
    if (password === "") throw new Error();
    const hash = await bcrypt.hash(password, 10);
    const newUser = new User({
      ...req.body,
      password: hash,
    });
    const { _id } = await newUser.save();
    const accessToken = jwt.sign({ _id }, SECRET_KEY);
    res.status(201).send({ accessToken });
  } catch (error) {
    console.log("ERROR", error);
    res.status(400).send({ error, message: "Could not create user" });
  }
};

// USER LOGIN
exports.userLogin = async (req, res) => {
    console.log('inside')
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email: email } });
    const validatedPass = await bcrypt.compare(password, user.password);
    if (!validatedPass) throw new Error();
    const accessToken = jwt.sign({ _id: user._id }, SECRET_KEY);
    res.status(200).send({ accessToken, success: true });
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .send({ error: "401", message: "Username or password is incorrect" });
  }
};

// GET USER PROFILE
exports.getUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        //console.log('ID', id);
        const user = await User.findByPk(id);
        console.log('USER', user)
        delete user.dataValues.password;
        res.status(200).send(user);

    } catch (error) {
        res.status(404).send({ error, message: 'Resource not found' });
    }
};


// GET ALL USERS
exports.getAllUsers = async (req, res) => {
    console.log('IM HERE');
    try {
        const users = await User.findAll();
        //console.log('USERS', users);
        return res.status(200).json(users);
    } catch (error) {
        console.error('ERROR', error);
        return res.status(500).send({res: 'Internal server error', error: true});
    }
};

// GET USER RESERVATIONS
exports.getUserReservations = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findOne({ where: {id: id},
            include: {
                model: Reservation,
                as: 'userReserve',
                attributes: ['reserveDate', 'partySize']
            },
            attributes: ['name', 'lastName', 'email']
        });
        return res.status(200).json(user);
    } catch (error) {
        console.error(error, 'in controllers');
        return res.status(500).send({res: 'Internal server error', error: true});
    }
};

exports.userLogout = (req, res) => {

};